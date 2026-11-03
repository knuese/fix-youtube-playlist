import { getAuthUrl, setTokens } from './server/ytClient.ts'

if (process.argv.includes('--login')) {
  const url = await getAuthUrl()
  console.log(url)
} else if (process.argv.includes('--code')) {
  const code = process.argv.pop()
  await setTokens(code as string)
} else {
  console.error('USAGE: npx tsx --login OR npx tsx --code <<CODE>>')
  process.exit(1)
}
