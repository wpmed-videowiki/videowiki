import { User as UserModel } from '../../../shared/models'

const MediaWikiStrategy = require('passport-mediawiki-oauth').OAuthStrategy

const amqp = require('amqplib/callback_api')
const RABBITMQ_AUTH_EXCHANGE = 'RABBITMQ_AUTH_EXCHANGE'

const args = process.argv.slice(2)
const lang = args[1]

const RABBITMQ_AUTH_QUEUE = `RABBITMQ_AUTH_QUEUE_${lang}`
let authExchangeChannel

amqp.connect(process.env.RABBITMQ_SERVER, (err, conn) => {
  if (err) {
    return console.log('Error connecting to rabbit mq in auth ', err)
  }
  console.log('connected to rabbitmq for authentication')
  conn.createChannel((err, ch) => {
    if (err) {
      return console.log('Error creating channel in rabbitmq in auth ', err)
    }
    console.log('created a channel for ', RABBITMQ_AUTH_EXCHANGE)
    ch.assertExchange(RABBITMQ_AUTH_EXCHANGE, 'fanout', { durable: true })
    authExchangeChannel = ch
    ch.assertQueue(RABBITMQ_AUTH_QUEUE, { durable: true }, (err, q) => {
      if (err) {
        return console.log('error asserting queue ', RABBITMQ_AUTH_QUEUE, err)
      }
      ch.bindQueue(RABBITMQ_AUTH_QUEUE, RABBITMQ_AUTH_EXCHANGE, '')
    })
  })
})

module.exports = passport => {
  // Use the MediaWikiStrategy within Passport.
  //   Strategies in passport require a `verify` function, which accept
  //   credentials (in this case, a token, tokenSecret, and MediaWiki profile),
  //   and invoke a callback with a user object.

  const strategy = new MediaWikiStrategy(
    {
      baseURL: 'https://nccommons.org/',
      consumerKey: process.env.NCCOMMONS_CONSUMER_KEY,
      consumerSecret: process.env.NCCOMMONS_CONSUMER_SECRET
    },
    (token, tokenSecret, profile, done) => {
      // asynchronous verification, for effect...
      process.nextTick(() => {
        // To keep the example simple, the user's MediaWiki profile is returned to
        // represent the logged-in user.  In a typical application, you would want
        // to associate the MediaWiki account with a user record in your database,
        // and return that user instead.
        UserModel.findOne({ nccommonsId: profile.id }).then((userInfo) => {
          if (userInfo) {
            // User already exists, update access token and secret
            const userData = {
              nccommonsId: profile.id,
              username: profile.displayName,
              nccommonsToken: token,
              nccommonsTokenSecret: tokenSecret
            }

            UserModel.findByIdAndUpdate(
              userInfo._id,
              {
                $set: {
                  nccommonsToken: token,
                  nccommonsTokenSecret: tokenSecret
                }
              },
              { new: true },
            ).then(
              ( userInfo) => {
                authExchangeChannel.publish(
                  RABBITMQ_AUTH_EXCHANGE,
                  '',
                  new Buffer(JSON.stringify(userData))
                )
                return done(null, {
                  _id: userInfo._id,
                  nccommonsId: profile.id,
                  username: profile.displayName,
                  nccommonsToken: token
                })
              }
            )
            .catch(err => {
                if (err) return done(err)
            })
          } else {
            // User dont exst, create one
            const newUserData = {
              nccommonsId: profile.id,
              username: profile.displayName,
              nccommonsToken: token,
              nccommonsTokenSecret: tokenSecret
            }
            const newUser = new UserModel(newUserData)

            newUser.save().then(() => {
              authExchangeChannel.publish(
                RABBITMQ_AUTH_EXCHANGE,
                '',
                new Buffer(JSON.stringify(newUserData))
              )
              return done(null, newUser)
            })
            .catch(err=> {
              if (err) return done(err)
            })
          }
        })
        .catch(err => {
          if (err) return done(err)
        })
      })
    }
  )
  strategy.name = 'nccommons';

  passport.use(strategy)
}
