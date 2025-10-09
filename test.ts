import {google} from 'googleapis'
import * as fs from 'fs/promises'
import * as readline from 'readline'
import {OAuth2Client} from "google-auth-library";

// OAuth credentials file
const CREDENTIALS_PATH = './client_secret.json'
const TOKEN_PATH = './token.json'

// Scopes required for YouTube Data API
const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly']

async function getAuthenticatedClient(): Promise<OAuth2Client> {
    const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8')
    const {client_id, client_secret, redirect_uris} = JSON.parse(content).installed
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

    try {
        const token = await fs.readFile(TOKEN_PATH, 'utf-8')
        oAuth2Client.setCredentials(JSON.parse(token))
        return oAuth2Client
    } catch (err) {
        return getNewToken(oAuth2Client)
    }
}

function getNewToken(oAuth2Client): Promise<OAuth2Client> {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    })

    console.log('\n🔗 Authorize this app by visiting this URL:\n')
    console.log(authUrl)
    console.log('\n📋 After authorization, paste the code below:\n')

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    return new Promise((resolve, reject) => {
        rl.question('Enter the code from that page here: ', async (code) => {
            rl.close()
            try {
                const {tokens} = await oAuth2Client.getToken(code)
                oAuth2Client.setCredentials(tokens)
                await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens))
                resolve(oAuth2Client)
            } catch (err) {
                reject(err)
            }
        })
    })
}

async function main() {
    const auth = await getAuthenticatedClient()
    const youtube = google.youtube({version: 'v3', auth})

    let nextPageToken = ''
    const allVideos = []

    do {
        const res = await youtube.playlistItems.list({
            part: ['snippet'],
            playlistId: 'PLIiySdUAkcfzeIUd6FKQgzZ7dcje5Ccv2',
            pageToken: nextPageToken,
            maxResults: 50
        })

        console.log(`received ${res.data.items.length} items, nextPageToken: ${res.data.nextPageToken}`)

        allVideos.push(...res.data.items.map((item) => ({
            title: item.snippet.title,
            id: item.snippet.resourceId.videoId
        })))

        nextPageToken = res.data.nextPageToken
    } while (nextPageToken)

    console.log(JSON.stringify(allVideos, null, 2))
}

main().catch(console.error)
