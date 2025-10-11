import { chromium, expect, test } from '@playwright/test'

test('run playlist', async () => {
  const browser = await chromium.connectOverCDP(process.env.WS_URL)

  const contexts = browser.contexts()
  const context = contexts[0] ?? (await browser.newContext())

  const page = await context.newPage()

  await page.goto(process.env.APP_URL)
  await expect(page).toHaveTitle('fix-youtube-playlist')

  const input = page.getByRole('textbox')
  await input.pressSequentially(process.env.PLAYLIST_ID)
  await page.keyboard.press('Enter')

  const pickVideo = async () => {
    const newVideoButton = page.getByText('Pick New Video')
    await newVideoButton.click()

    const selected = page.getByTestId('selected')
    await expect(selected).toBeVisible()

    const videoId = await selected.getByTestId('video-id').textContent()
    expect(videoId).toBeTruthy()

    const videoTab = await context.newPage()
    await videoTab.goto(`https://youtube.com/watch?v=${videoId}`)

    const timeText = await videoTab.locator('.ytp-time-duration').textContent()
    const [minutes, seconds] = timeText.split(':')
    const duration = Number(seconds) * 1000 + Number(minutes) * 1000 * 60

    await expect(videoTab.locator('.html5-endscreen')).toBeVisible({
      timeout: duration + 10000
    })

    await videoTab.close()

    return pickVideo()
  }

  await pickVideo()
})
