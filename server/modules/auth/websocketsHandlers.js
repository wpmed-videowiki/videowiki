import {
  AUTHENTICATE,
  AUTHENTICATE_FAILED,
  AUTHENTICATE_SUCCESS
} from '../shared/vendors/websockets/events'
import { SocketConnection as SocketConnectionModel } from '../shared/models'
const jwt = require('jsonwebtoken')

export const handlers = [
  {
    event: AUTHENTICATE,
    handler: socket => data => {
      const { token } = data
      if (token) {
        jwt.verify(token, process.env.APP_SECRET, (err, user) => {
          if (err) {
            console.log('Websocket decodeApiToken - error ', err)
            return socket.emit(AUTHENTICATE_FAILED)
          }
          console.log(
            'authenticating user socket',
            user.mediawikiId || user.nccommonsId,
            socket.id
          )
          const { mediawikiId, nccommonsId } = user
          if (mediawikiId) {
            SocketConnectionModel.findOneAndUpdate(
              { mediawikiId },
              { $set: { mediawikiId, socketId: socket.id } },
              { upsert: true, new: true },
            ).then(
              ( socketConnection) => {
                return socket.emit(AUTHENTICATE_SUCCESS, socketConnection)
              }
            )
            .catch(err => {
                if (err) {
                  console.log('error authenticating user', err)
                  return socket.emit(AUTHENTICATE_FAILED)
                }
            })
          } else if (nccommonsId) {
            SocketConnectionModel.findOneAndUpdate(
              { nccommonsId },
              { $set: { nccommonsId, socketId: socket.id } },
              { upsert: true, new: true },
            ).then(
              (socketConnection) => {
                if (err) {
                  console.log('error authenticating user', err)
                  return socket.emit(AUTHENTICATE_FAILED)
                }
                return socket.emit(AUTHENTICATE_SUCCESS, socketConnection)
              }
            )
            .catch(err => {
                if (err) {
                  console.log('error authenticating user', err)
                  return socket.emit(AUTHENTICATE_FAILED)
                }
            })
          }
        })
      } else {
        return socket.emit(AUTHENTICATE_FAILED)
      }
    }
  }
]
