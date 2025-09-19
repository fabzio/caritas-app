#!/usr/bin/env bun

import { exec } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'

const execAsync = promisify(exec)
const API_PATH = join(process.cwd(), 'apps', 'api')
const DB_PATH = join(process.cwd(), 'apps', 'db')

async function runCommand(command: string, cwd?: string): Promise<void> {
  try {
    console.log(`Running: ${command}`)
    const { stdout, stderr } = await execAsync(command, { cwd })
    if (stdout) console.log(stdout)
    if (stderr) console.error(stderr)
  } catch (error) {
    console.error(`Error running command: ${command}`, error)
    throw error
  }
}

async function setupDevelopment() {
  console.log('🚀 Configurando entorno de desarrollo...\n')

  // Verificar que estamos en la raíz del proyecto
  if (!existsSync('package.json') || !existsSync('turbo.json')) {
    console.error('❌ Este script debe ejecutarse desde la raíz del monorepo')
    process.exit(1)
  }

  try {
    // 1. Instalar dependencias
    console.log('📦 Instalando dependencias...')
    await runCommand('bun install')
    console.log('✅ Dependencias instaladas\n')

    // 2. Verificar si Docker está corriendo
    console.log('🐳 Verificando Docker...')
    try {
      await runCommand('docker ps')
      console.log('✅ Docker está corriendo\n')
    } catch {
      console.log(
        '⚠️  Docker no está corriendo. Asegúrate de iniciarlo antes de continuar.\n',
      )
    }

    // 3. Levantar base de datos
    if (existsSync(DB_PATH)) {
      console.log('🗄️  Iniciando base de datos...')
      await runCommand(
        'docker compose --env-file .env.development up -d',
        DB_PATH,
      )
      console.log('✅ Base de datos iniciada\n')

      // Esperar un poco para que la DB esté lista
      console.log('⏳ Esperando que la base de datos esté lista...')
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }

    // 4. Migrar esquema de la base de datos
    if (existsSync(API_PATH)) {
      console.log('📊 Migrando esquema de la base de datos...')
      await runCommand('bun run db:push', API_PATH)
      console.log('✅ Esquema migrado\n')
    }

    console.log('🎉 ¡Entorno de desarrollo configurado correctamente!')
    console.log('\n📋 Próximos pasos:')
    console.log("1. Ejecuta 'bun dev' para iniciar todas las aplicaciones")
    console.log('2. La documentación de la API estará disponible en:')
    console.log(
      '   http://localhost:5173/api/v1/swagger (o :8000 dependiendo del puerto)',
    )
    console.log(
      '3. Revisa la terminal para ver los puertos de cada aplicación\n',
    )
  } catch (error) {
    console.error('❌ Error durante la configuración:', error)
    process.exit(1)
  }
}

// Ejecutar la función principal
setupDevelopment().catch(console.error)

export { setupDevelopment }
