import {google} from 'googleapis'
import fs from 'fs/promises'
import readline from 'readline'

// OAuth credentials file
const CREDENTIALS_PATH = './client_secret.json'
const TOKEN_PATH = './token.json'

// Scopes required for YouTube Data API
const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly']

async function getAuthenticatedClient() {
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

function getNewToken(oAuth2Client) {
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
                console.log('✅ Token stored to', TOKEN_PATH)
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

    const res = await youtube.playlistItems.list({
        part: ['snippet'],
        playlistId: 'UULFLz90dMxYYJjkTNCTAapp_w', // Replace if using a different playlist
        maxResults: 10,
    })

    console.log('\n🎬 Playlist Items:\n')
    console.log(JSON.stringify(res.data, null, 2))
}

main().catch(console.error)
