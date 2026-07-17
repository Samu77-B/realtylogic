import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

export function loadEnvFile() {
  const envPath = join(process.cwd(), '.env')

  if (!existsSync(envPath)) return

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim()

    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}
