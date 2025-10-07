#!/usr/bin/env bun

import type { ChildProcess } from 'node:child_process'
import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const dim = '\u001b[2m'
const reset = '\u001b[0m'
const API_PATH = join(process.cwd(), 'apps', 'api')
const DB_PATH = join(process.cwd(), 'apps', 'db')
const API_ENV_FILE = join(API_PATH, '.env.development')

function loadApiEnv() {
  if (!existsSync(API_ENV_FILE)) return
  const lines = readFileSync(API_ENV_FILE, 'utf8').split('\n')
  for (const raw of lines) {
    const line = raw.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const [k, ...rest] = line.split('=')
    // biome-ignore lint/style/noNonNullAssertion: we check above that k exists
    const key = k!.trim()
    const value = rest.join('=').trim()
    process.env[key] = value
  }
  process.env.NODE_ENV = 'development'
}

function attachLogs(child: ChildProcess): void {
  child.stdout?.on('data', (chunk) => {
    const text = chunk.toString()
    if (!text) return
    process.stdout.write(`${dim}${text}${reset}`)
  })
  child.stderr?.on('data', (chunk) => {
    const text = chunk.toString()
    if (!text) return
    process.stderr.write(`${dim}${text}${reset}`)
  })
}

async function runCommand(
  command: string,
  cwd?: string,
  extraEnv: Record<string, string> = {},
): Promise<void> {
  console.log(`Running: ${command}`)
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, {
      cwd,
      env: { ...process.env, ...extraEnv },
      shell: true,
      stdio: ['inherit', 'pipe', 'pipe'],
    })
    attachLogs(child)
    child.on('error', (error) => {
      console.error(`Error running command: ${command}`, error)
      reject(error)
    })
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      const error = new Error(`Command failed with exit code ${code ?? -1}`)
      console.error(`Error running command: ${command}`, error)
      reject(error)
    })
  })
}

async function waitForDatabase(): Promise<void> {
  const maxAttempts = 30
  let attempts = 0
  while (attempts < maxAttempts) {
    try {
      await runCommand('docker exec caritas_db pg_isready -h localhost -p 5432')
      console.log('✅ Base de datos lista para conexiones\n')
      return
    } catch {
      attempts++
      console.log(`Esperando base de datos... (${attempts}/${maxAttempts})`)
      await new Promise((r) => setTimeout(r, 2000))
    }
  }
  throw new Error(
    'Timeout: La base de datos no respondió después de 60 segundos',
  )
}

async function setupDevelopment() {
  console.log('🚀 Configurando entorno de desarrollo...\n')

  if (!existsSync('package.json') || !existsSync('turbo.json')) {
    console.error('❌ Este script debe ejecutarse desde la raíz del monorepo')
    process.exit(1)
  }

  loadApiEnv()

  try {
    console.log('📦 Instalando dependencias...')
    await runCommand('bun install')
    console.log('✅ Dependencias instaladas\n')

    console.log('🐳 Verificando Docker...')
    try {
      await runCommand('docker ps')
      console.log('✅ Docker está corriendo\n')
    } catch {
      console.log(
        '⚠️  Docker no está corriendo. Asegúrate de iniciarlo antes de continuar.\n',
      )
    }

    if (existsSync(DB_PATH)) {
      console.log('🗄️  Iniciando base de datos...')
      await runCommand(
        'docker compose --env-file .env.development up -d',
        DB_PATH,
      )
      console.log('✅ Base de datos iniciada\n')
      console.log('⏳ Esperando que la base de datos esté lista...')
      await waitForDatabase()
    }

    if (existsSync(API_PATH)) {
      console.log('📊 Migrando esquema de la base de datos...')
      await runCommand(
        'bun --env-file=.env.development drizzle-kit push',
        API_PATH,
        { NODE_ENV: 'development' },
      )
      console.log('✅ Esquema migrado\n')
      console.log('🌱 Sembrando datos iniciales...')
      await runCommand(
        'bun --env-file=.env.development src/db/seed.ts',
        API_PATH,
        { NODE_ENV: 'development' },
      )
      console.log('✅ Datos sembrados\n')
    }

    console.log('🎉 ¡Entorno de desarrollo configurado correctamente!')
    console.log('\n📋 Próximos pasos:')
    console.log("1. Ejecuta 'bun dev' para iniciar todas las aplicaciones")
    console.log(
      '2. Documentación: http://localhost:5173/api/v1/swagger (o :8000)',
    )
    console.log('3. Revisa la terminal para puertos\n')
  } catch (error) {
    console.error('❌ Error durante la configuración:', error)
    process.exit(1)
  }
}

setupDevelopment().catch(console.error)

export { setupDevelopment }
