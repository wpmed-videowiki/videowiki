const jwt = require('jsonwebtoken')
import uuidV4 from 'uuid/v4'
import { GlobalSettings, User } from '../shared/models'
import {
  createPlaylist,
  getChannel,
  getNewTokenUrl,
  getTokenFromCode,
  uploadYoutubeVideo
} from '../shared/services/youtube'

const path = require('path')
const PopupTools = require('popup-tools')

const MONTH_TIME = 60 * 60 * 24 * 30

const usersController = {
  validateSession (req, res) {
    // Refresh the token
    if (req.user && req.user.mediawikiId) {
      User.findOne({ mediawikiId: req.user.mediawikiId }, (err, user) => {
        if (err || !user || !user.mediawikiId) {
          console.log('jwt error fetching user data token request ', err)
          return res.send(401, 'Unauthorized!')
        }
        jwt.sign(
          user.toObject(),
          process.env.APP_SECRET,
          { expiresIn: MONTH_TIME },
          (err, token) => {
            if (err) {
              console.log('jwt error while refreshing token request ', err)
              return res.send(401, 'Unauthorized!')
            }
            return res.json({ user, token })
          }
        )
      })
    } else {
      const anonymId = req.headers['x-vw-anonymous-id'] || uuidV4()
      return res.json({ anonymousId: anonymId })
    }
  },

  logOut (req, res) {
    req.logout()
    req.logOut()
    req.session.destroy(() => {
      req.session = null
      res.send('Logout successfull!')
    })
  },

  generateYoutubeAuthLink (req, res) {
    const pw = req.body.password
    if (pw !== process.env.LINK_YOUTUBE_PASSWORD) {
      return res.status(403).send('Unauthorized')
    }

    const url = getNewTokenUrl()
    return res.json({ url })
  },

  connectYoutubeChannel (req, res) {
    const { code } = req.query
    getTokenFromCode(code).then(token => {
      // GlobalSettings.ups
      GlobalSettings.findOneAndUpdate(
        { key: 'youtube_token' },
        { key: 'youtube_token', value: JSON.stringify(token) },
        { upsert: true },
        err => {
          if (err) {
            console.log({ err })
            return res.status(400).json({ message: 'Soemthing went wrong' })
          }
          getChannel(token)
            .then(channelData => {
              res.end(PopupTools.popupResponse({ channelData }))
            })
            .catch(err => {
              console.log(err)
              return res.status(400).json({ error: 'Something went wrong' })
            })
        }
      )
    })
  }
}
export default usersController
