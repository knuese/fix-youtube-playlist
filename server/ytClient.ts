import * as fs from 'fs/promises'
import { google, youtube_v3 } from 'googleapis'
import * as readline from 'readline'

// OAuth credentials file
const CREDENTIALS_PATH = './client_secret.json'
const TOKEN_PATH = './token.json'

// Scopes required for YouTube Data API
const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly']

export const getYouTubeClient = async (): Promise<youtube_v3.Youtube> => {
  const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8')
  const { client_id, client_secret, redirect_uris } =
    JSON.parse(content).installed
  let oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  )

  try {
    const token = await fs.readFile(TOKEN_PATH, 'utf-8')
    oAuth2Client.setCredentials(JSON.parse(token))
  } catch (err) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    })

    console.log(`authorize here: ${authUrl}`)

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    oAuth2Client = await new Promise((resolve, reject) => {
      rl.question('code: ', async (code) => {
        rl.close()
        try {
          const { tokens } = await oAuth2Client.getToken(code)
          oAuth2Client.setCredentials(tokens)
          await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens))
          resolve(oAuth2Client)
        } catch (err) {
          reject(err)
        }
      })
    })
  }

  return google.youtube({ version: 'v3', auth: oAuth2Client })
}
