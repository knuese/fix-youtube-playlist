import express from 'express'

import { getAuthUrl, getYouTubeClient, setTokens } from './ytClient.ts'

const PORT = 8888

const app = express()

app.post('/oauth-code', async (req, res) => {
  const code = req.body.code

  if (!code) {
    return res.status(400).send('must provide code')
  }

  try {
    await setTokens(code)
  } catch (e) {
    console.error('failed to set tokens', e)
    return res.status(500).send('failed to send tokens')
  }

  res.status(200).send('set tokens')
})

app.get('/playlist/:id', async (req, res) => {
  const playlistId = req.params.id

  if (!playlistId) {
    return res.status(400).send('must provide playlist ID')
  }

  try {
    const yt = await getYouTubeClient()

    const videos = []
    let nextPageToken = ''

    do {
      const res = await yt.playlistItems.list({
        part: ['snippet'],
        playlistId,
        pageToken: nextPageToken,
        maxResults: 50
      })

      console.log(
        `received ${res.data.items?.length} items, nextPageToken: ${res.data.nextPageToken}`
      )

      videos.push(
        ...(res.data.items ?? []).map((item) => {
          const { title, resourceId } = item.snippet!
          return { title, id: resourceId!.videoId }
        })
      )

      nextPageToken = res.data.nextPageToken ?? ''
    } while (nextPageToken)

    res.status(200).send(videos)
  } catch (e) {
    console.error('failed to get playlist', e)
    res
      .status(500)
      .send({ authUrl: await getAuthUrl(), message: 'failed to get playlist' })
  }
})

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})
