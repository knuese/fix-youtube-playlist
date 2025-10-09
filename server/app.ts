import express from 'express'

import { getYouTubeClient } from './ytClient.ts'

const PORT = 8888

const app = express()

app.get('/playlist/:id', async (req, res) => {
  if (!req.params.id) {
    res.status(400).send('must provide playlist ID')
  }

  try {
    const yt = await getYouTubeClient()

    const videos = []
    let nextPageToken = ''

    do {
      const res = await yt.playlistItems.list({
        part: ['snippet'],
        playlistId: 'PLIiySdUAkcfzeIUd6FKQgzZ7dcje5Ccv2',
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

    res.status(200).send({ videos })
  } catch (e) {
    console.error('failed to get playlist', e)
    res.status(500).send('failed to get playlist')
  }
})

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})
