const fs = require('fs')
const async = require('async')
const readline = require('readline')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube'
]

const CALLBACK_URL =
  process.env.OAUTH_CALLBACK_URL ||
  'http://localhost:4000/api/auth/youtube/authenticate/connect'

const TOKEN_DIR =
  (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) +
  '/.credentials/'
const TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json'

// Load client secrets from a local file.
const credentials = JSON.parse(
  fs.readFileSync(process.env.OAUTH_CLIENT_CREDENTIALS, { encoding: 'utf-8' })
)
const clientSecret = credentials.web.client_secret
const clientId = credentials.web.client_id
// const redirectUrl = credentials.redirect_uris[0];
const oauth2Client = new OAuth2(clientId, clientSecret, CALLBACK_URL)

export function getNewTokenUrl () {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  })
  console.log('Authorize this app by visiting this url: ', authUrl)
  return authUrl
}

export function getTokenFromCode (code) {
  return new Promise((resolve, reject) => {
    oauth2Client
      .getToken(code)
      .then(res => resolve(res.tokens))
      .catch(reject)
  })
}

export function refreshToken (token) {
  return new Promise((resolve, reject) => {
    const auth = new OAuth2(clientId, clientSecret, CALLBACK_URL)

    auth.credentials = token

    auth.refreshToken(token.refresh_token).then(refresh => {
      const newToken = {
        ...token,
        ...refresh.tokens
      }
      return resolve(newToken)
    })
    .catch(reject)
  })
}

export function getChannel (token) {
  const auth = new OAuth2(clientId, clientSecret, CALLBACK_URL)

  auth.credentials = token

  var service = google.youtube('v3')
  return new Promise((resolve, reject) => {
    service.channels
      .list({
        auth,
        part: 'snippet,contentDetails,statistics',
        mine: true
      })
      .then(({ data }) => {
        const channels = data.items

        const channelData = {
          id: channels[0].id,
          title: channels[0].snippet.title,
          thumbnail:
            channels[0].snippet.thumbnails &&
            channels[0].snippet.thumbnails.medium
              ? channels[0].snippet.thumbnails.medium.url
              : ''
        }

        return resolve(channelData)
      })
      .catch(reject)
  })
}

export function createPlaylist ({ token, title }) {
  const auth = new OAuth2(clientId, clientSecret, CALLBACK_URL)
  auth.credentials = token

  const service = google.youtube('v3')

  return service.playlists.insert({
    auth,
    part: 'snippet, status',
    requestBody: { snippet: { title }, status: { privacyStatus: 'public' } }
  })
}

export function uploadYoutubeVideo ({ playlistId, title, videoPath, token }) {
  const auth = new OAuth2(clientId, clientSecret, CALLBACK_URL)
  auth.credentials = token
  const service = google.youtube('v3')
  let videoId = ''
  return service.videos
    .insert({
      auth,
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title
        },
        status: {
          privacyStatus: 'public'
        }
      },
      media: {
        body: fs.createReadStream(videoPath)
      }
    })
    .then(({ data }) => {
      console.log('uploaded video', { data })
      videoId = data.id
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          service.playlistItems
            .insert({
              auth,
              part: 'snippet',
              requestBody: {
                snippet: {
                  playlistId,
                  resourceId: {
                    videoId: data.id,
                    kind: 'youtube#video'
                  }
                }
              }
            })
            .then(resolve)
            .catch(resolve)
        }, 20 * 1000)
      })
    })
    .then(res => {
      console.dir({ res }, { depth: null })

      return Promise.resolve(videoId)
    })
}
