import { GlobalSettings, User } from '../shared/models';
import { refreshToken } from '../shared/services/youtube'

const jwt = require('jsonwebtoken');
const amqp = require('amqplib/callback_api');
const RABBITMQ_AUTH_EXCHANGE = 'RABBITMQ_AUTH_EXCHANGE';

const args = process.argv.slice(2);
const lang = args[1];

const RABBITMQ_AUTH_QUEUE = `RABBITMQ_AUTH_QUEUE_${lang}`;

function isAuthenticated(req, res, next) {
  // if user is authenticated in the session, call the next() to call the next request handler
  // Passport adds this method to request object. A middleware is allowed to add properties to
  // request and response objects
  if (req.user) {
    return next()
  }
  // if the user is not authenticated then redirect him to the login page
  res.send(401, 'Unauthorized!')
}

function signRequest(req, res, next) {
  // console.log(req.session, 'users session ', req.user, 'user obj')
  const token = req.headers['x-access-token'];
  if (!token) {
    return next();
  }
  jwt.verify(token, process.env.APP_SECRET, (err, user) => {
    if (err) {
      console.log('decodeApiToken - error ', err);
    } else {
      req.user = user;
    }
    next();
  });
}

function signupCrossWikiUser(userInfo) {
  if (userInfo) {
    const {
      username,
      mediawikiId,
      mediawikiToken,
      mediawikiTokenSecret,
      nccommonsId,
      nccommonsToken,
      nccommonsTokenSecret,
    } = userInfo;

    if (mediawikiId) {
      User.findOneAndUpdate({ mediawikiId }, { $set: { mediawikiId, username, mediawikiToken, mediawikiTokenSecret } }, { upsert: true, new: true }).then((user) => {
      })
      .catch(err => {
        if (err) {
          return console.log('error creating cross authentication user ', err);
        }
      })
    } else if (nccommonsId) {
      User.findOneAndUpdate({ nccommonsId }, { $set: { nccommonsId, username, nccommonsToken, nccommonsTokenSecret } }, { upsert: true, new: true }).then((user) => {
      })
      .catch(err => {
        if (err) {
          return console.log('error creating cross authentication user ', err);
        }
      })
    }
  }
}

function saveCrossWikiYoutubeToken(token) {
   GlobalSettings.findOneAndUpdate(
        { key: 'youtube_token' },
        { key: 'youtube_token', value: JSON.stringify(token) },
        { upsert: true },
      )
      .then(() => {})
      .catch(
        (err) => {
          if (err) {
            console.log('Error insering cross youtube token', err)
          }
        },
   )
}

function refreshYoutubeToken() {
  return new Promise((resolve, reject) => {
    GlobalSettings.findOne({ key: 'youtube_token'}).then(( record) => {
      if (!record) return reject(new Error('No token set yet'))
      refreshToken(JSON.parse(record.value))
      .then((newToken) => {
        saveCrossWikiYoutubeToken(newToken);
        return resolve(newToken);
      }).catch(reject)
    })
    .catch(err => {
      if (err) return reject(err);
    })
  })
}

function initRabbitMQ() {
  amqp.connect(process.env.RABBITMQ_SERVER, (err, conn) => {
    if (err) {
      return console.log('Error connecting to rabbit mq in auth ', err);
    }
    console.log('connected to rabbitmq for authentication')
    conn.createChannel((err, ch) => {
      if (err) {
        return console.log('Error creating channel in rabbitmq in auth ', err);
      }
      console.log('created a channel for ', RABBITMQ_AUTH_EXCHANGE)
      ch.assertExchange(RABBITMQ_AUTH_EXCHANGE, 'fanout', { durable: true });
      ch.assertQueue(RABBITMQ_AUTH_QUEUE, { durable: true }, (err) => {
        if (err) {
          return console.log('error asserting queue ', RABBITMQ_AUTH_QUEUE, err);
        }

        ch.bindQueue(RABBITMQ_AUTH_QUEUE, RABBITMQ_AUTH_EXCHANGE, '');
        ch.consume(RABBITMQ_AUTH_QUEUE, (msg) => {
          const userInfo = JSON.parse(msg.content.toString());
          signupCrossWikiUser(userInfo);
          ch.ack(msg)
        })
      })
    })
  })
}

export default {
  isAuthenticated,
  signRequest,
  initRabbitMQ,
  signupCrossWikiUser,
  saveCrossWikiYoutubeToken,
  refreshYoutubeToken
}
