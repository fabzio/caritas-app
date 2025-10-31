import { spawn, spawnSync } from 'node:child_process'

type ComposeCommand = 'docker compose' | 'docker-compose'

type CheckResult = {
  command: ComposeCommand
  binary: string
  args: string[]
  path: string
}

const bunRuntime = (
  globalThis as { Bun?: { which?(name: string): string | null } }
).Bun

const locate = (name: string): string | null => {
  if (bunRuntime?.which) return bunRuntime.which(name) ?? null
  const binary = process.platform === 'win32' ? 'where' : 'which'
  const resolved = spawnSync(binary, [name], { encoding: 'utf8' })
  if (resolved.status !== 0 || !resolved.stdout) return null
  const text = resolved.stdout.toString().trim()
  if (!text) return null
  const candidates = text.split('\n')
  for (const entry of candidates) {
    const candidate = entry.trim()
    if (candidate.length > 0) return candidate
  }
  return null
}

const detect = (): CheckResult | null => {
  const dockerPath = locate('docker')
  if (dockerPath) {
    const composeProbe = spawnSync('docker', ['compose', 'version'], {
      stdio: 'pipe',
    })
    if (composeProbe.status === 0) {
      return {
        command: 'docker compose',
        binary: 'docker',
        args: ['compose'],
        path: dockerPath,
      }
    }
  }
  const dockerComposePath = locate('docker-compose')
  if (dockerComposePath) {
    return {
      command: 'docker-compose',
      binary: 'docker-compose',
      args: [],
      path: dockerComposePath,
    }
  }
  return null
}

const result = detect()

if (!result) {
  console.error(
    'Missing docker compose support. Install Docker with Compose plugin or docker-compose binary.',
  )
  process.exit(1)
}

console.log(`Detected ${result.command} at ${result.path}`)

const providedArgs = process.argv.slice(2)
const args =
  providedArgs.length > 0
    ? providedArgs
    : ['--env-file', '.env.development', 'up']

const child = spawn(result.binary, [...result.args, ...args], {
  stdio: 'inherit',
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})

child.on('error', (error) => {
  console.error(error.message)
  process.exit(1)
})
