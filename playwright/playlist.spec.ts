import { chromium, expect, test } from '@playwright/test'
import ky from 'ky'

test('run playlist', async () => {
  const { webSocketDebuggerUrl } = await ky
    .get(`http://localhost:${process.env.DEBUG_PORT}/json/version`)
    .json<Record<string, string>>()

  const browser = await chromium.connectOverCDP(webSocketDebuggerUrl)
  const contexts = browser.contexts()
  const context = contexts[0] ?? (await browser.newContext())

  const playlistPage = await context.newPage()

  await playlistPage.goto(process.env.APP_URL)
  await expect(playlistPage).toHaveTitle('fix-youtube-playlist')

  const input = playlistPage.getByRole('textbox')
  await input.pressSequentially(process.env.PLAYLIST_ID)
  await playlistPage.keyboard.press('Enter')

  const pickVideo = async () => {
    const newVideoButton = playlistPage.getByText('Pick New Video')
    await newVideoButton.click()

    const selected = playlistPage.getByTestId('selected')
    await expect(selected).toBeVisible()

    const videoId = await selected.getByTestId('video-id').textContent()
    expect(videoId).toBeTruthy()

    return videoId
  }

  const goToVideo = async (videoId: string) => {
    if (playlistPage.isClosed()) {
      return
    }

    const videoTab = await context.newPage()
    await videoTab.goto(`https://youtube.com/watch?v=${videoId}`)

    const timeText = await videoTab.locator('.ytp-time-duration').textContent()
    const [minutes, seconds] = timeText.split(':')

    // +10000 to account for potential buffering
    const timeout = Number(seconds) * 1000 + Number(minutes) * 1000 * 60 + 10000

    const [videoEnded, newVideo] = await Promise.allSettled([
      // wait for video to end
      (async () => {
        await expect(videoTab.locator('.html5-endscreen')).toBeVisible({
          timeout
        })

        await videoTab.close()

        return pickVideo()
      })(),
      (async () => {
        // check for change in selected video from user
        await expect(
          playlistPage.getByTestId('selected').getByTestId('video-id')
        ).not.toHaveText(videoId, { timeout })

        if (!videoTab.isClosed()) {
          await videoTab.close()
        }

        return playlistPage
          .getByTestId('selected')
          .getByTestId('video-id')
          .textContent()
      })()
    ])

    let nextVideo: string

    if (videoEnded.status === 'fulfilled') {
      nextVideo = videoEnded.value
    } else if (newVideo.status === 'fulfilled') {
      nextVideo = newVideo.value
    } else {
      throw new Error('failed to get next video')
    }

    return goToVideo(nextVideo)
  }

  // start the recursive loop
  await goToVideo(await pickVideo())
})
