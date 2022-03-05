import utils from '../utils'

const amqp = require('amqplib/callback_api')
const RABBITMQ_AUTH_EXCHANGE = 'RABBITMQ_AUTH_EXCHANGE'
const RABBITMQ_YT_TOKEN_EXCHANGE = 'RABBITMQ_YT_TOKEN_EXCHANGE'

const args = process.argv.slice(2)
const lang = args[1]

const RABBITMQ_AUTH_QUEUE = `RABBITMQ_AUTH_QUEUE_${lang}`
const RABBITMQ_YT_TOKEN_QUEUE = `RABBITMQ_YT_TOKEN_QUEUE_${lang}`

let channel

function initRabbitMQ () {
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
      channel = ch
      ch.assertExchange(RABBITMQ_AUTH_EXCHANGE, 'fanout', { durable: true })
      ch.assertQueue(RABBITMQ_AUTH_QUEUE, { durable: true }, err => {
        if (err) {
          return console.log('error asserting queue ', RABBITMQ_AUTH_QUEUE, err)
        }

        ch.bindQueue(RABBITMQ_AUTH_QUEUE, RABBITMQ_AUTH_EXCHANGE, '')
        ch.consume(RABBITMQ_AUTH_QUEUE, msg => {
          const userInfo = JSON.parse(msg.content.toString())
          utils.signupCrossWikiUser(userInfo)
          ch.ack(msg)
        })
      })

      ch.assertExchange(RABBITMQ_YT_TOKEN_EXCHANGE, 'fanout', { durable: true })
      ch.bindQueue(RABBITMQ_YT_TOKEN_QUEUE, RABBITMQ_YT_TOKEN_EXCHANGE, '')

      ch.assertQueue(RABBITMQ_YT_TOKEN_QUEUE, { durable: true }, err => {
        if (err) {
          return console.log(
            'error asserting queue ',
            RABBITMQ_YT_TOKEN_QUEUE,
            err
          )
        }

        ch.consume(RABBITMQ_YT_TOKEN_QUEUE, msg => {
          console.log('RECEIVED YOUTUBE TOKEN', msg.content.toString())
          utils.saveCrossWikiYoutubeToken(msg.content.toString())
          ch.ack(msg)
        })
      })
    })
  })
}

function onYoutubeAuth (token) {
  channel.publish(
    RABBITMQ_YT_TOKEN_EXCHANGE,
    '',
    Buffer.from(JSON.stringify(token))
  )
}

export default {
  initRabbitMQ,
  onYoutubeAuth
}
