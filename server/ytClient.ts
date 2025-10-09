import * as fs from 'fs/promises'
import { google, youtube_v3 } from 'googleapis'

// OAuth credentials file - relative to project root
const CREDENTIALS_PATH = './server/client_secret.json'
const TOKEN_PATH = './server/token.json'

// OAuth scopes for YouTube API
const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly']

const getOAuthClient = async () => {
  const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8')
  const { client_id, client_secret, redirect_uris } =
    JSON.parse(content).installed

  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
}

export const getAuthUrl = async () => {
  const oAuth2Client = await getOAuthClient()
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  })
}

export const setTokens = async (code: string) => {
  const oAuth2Client = await getOAuthClient()
  const { tokens } = await oAuth2Client.getToken(code)
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens))
}

export const getYouTubeClient = async (): Promise<youtube_v3.Youtube> => {
  const oAuth2Client = await getOAuthClient()

  const token = await fs.readFile(TOKEN_PATH, 'utf-8')
  oAuth2Client.setCredentials(JSON.parse(token))

  return google.youtube({ version: 'v3', auth: oAuth2Client })
}
