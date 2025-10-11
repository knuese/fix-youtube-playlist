import { defineConfig } from '@playwright/test'
import * as dotenv from 'dotenv'

dotenv.config({ path: './.env' })

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'line',
  timeout: 1000 * 60 * 60 * 4, // 4 hours
  use: {
    headless: false,
    trace: 'on-first-retry'
  }
})
