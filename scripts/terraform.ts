#!/usr/bin/env bun

import type { ChildProcess } from 'node:child_process'
import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { existsSync } from 'node:fs'
import { chmod, mkdir, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { stdin as input, stdout as output } from 'node:process'
import { createInterface } from 'node:readline/promises'

type DeployConfig = {
  awsRegion: string
  awsAccessKeyId: string
  awsSecretAccessKey: string
  awsSessionToken: string
  elasticIpAllocationId: string
  allowedCidrs: string[]
  appAmiId: string
  appInstanceType: string
  appRootVolumeSize: number
  dbEngineVersion: string
  dbInstanceClass: string
  dbAllocatedStorage: number
  dbMaxAllocatedStorage: number
  dbUsername: string
  runApply: boolean
}

type TerraformOutputValue<T> = {
  value: T
}

type TerraformOutputs = {
  instance_public_ip?: TerraformOutputValue<string>
  instance_public_dns?: TerraformOutputValue<string>
  db_endpoint?: TerraformOutputValue<string>
  db_port?: TerraformOutputValue<number>
  db_username?: TerraformOutputValue<string>
  db_password?: TerraformOutputValue<string>
  db_identifier?: TerraformOutputValue<string>
  valkey_endpoint?: TerraformOutputValue<
    Array<{ address: string; port: number }>
  >
  valkey_user?: TerraformOutputValue<string>
  valkey_password?: TerraformOutputValue<string>
  caritas_private_key_pem?: TerraformOutputValue<string>
  caritas_key_pair_name?: TerraformOutputValue<string>
}

type TerraformState = {
  outputs?: TerraformOutputs
}

type InfraSnapshots = {
  publicIp?: string
  publicDns?: string
  dbHost?: string
  dbPort?: number
  dbUser?: string
  dbPassword?: string
  dbName?: string
  valkeyHost?: string
  valkeyPort?: number
  valkeyUser?: string
  valkeyPassword?: string
  sshKeyPem?: string
  sshKeyName?: string
}

type EnvValues = {
  port: string
  nodeEnv: string
  betterAuthSecret: string
  betterAuthUrl: string
  databaseUrl: string
  valkeyUrl: string
  googleClientId: string
  googleClientSecret: string
  googleSmtpUser: string
  googleSmtpAppPassword: string
  cloudfareTurnstileSecretKey: string
}

type InstallConfig = {
  hostsPath: string
  envPath: string
  serverAlias: string
  serverIp: string
  serverDns: string
  sshUser: string
  sshKeyPath: string
  sshKeyContent?: string
  sshPort: number
  envValues: EnvValues
}

type PromptHelpers = {
  ask: (label: string, fallback?: string) => Promise<string>
  askRequired: (label: string, fallback?: string) => Promise<string>
  askNumber: (label: string, fallback: number) => Promise<number>
  askYesNo: (label: string, fallback?: boolean) => Promise<boolean>
  resolveAbsolute: (value: string) => string
}

type InventoryConfig = {
  hostsPath: string
  serverAlias: string
  serverIp: string
  serverDns: string
}

type SshConfig = {
  sshUser: string
  sshKeyPath: string
  sshKeyContent?: string
  sshPort: number
}

type EnvConfig = {
  envPath: string
  envValues: EnvValues
}

const dim = '\u001b[2m'
const reset = '\u001b[0m'

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

function parseNumberish(value: string, fallback: number): number {
  const parsed = Number.parseFloat(value)
  if (Number.isNaN(parsed)) return fallback
  return parsed
}

function ensureRepoRoot(): void {
  if (!existsSync('package.json') || !existsSync('turbo.json')) {
    console.error('Este script debe ejecutarse desde la raíz del monorepo')
    process.exit(1)
  }
}

function parseDbHost(endpoint?: string): { host?: string; port?: number } {
  if (!endpoint) return {}
  const [rawHost, rawPort] = endpoint.split(':')
  const host = rawHost?.trim()
  const port = rawPort ? Number.parseInt(rawPort, 10) : undefined
  return { host, port: Number.isNaN(port) ? undefined : port }
}

function extractInfra(outputs: TerraformOutputs): InfraSnapshots {
  const dbSplit = parseDbHost(outputs.db_endpoint?.value)
  const valkeyEndpoint = outputs.valkey_endpoint?.value?.[0]
  return {
    publicIp: outputs.instance_public_ip?.value,
    publicDns: outputs.instance_public_dns?.value,
    dbHost: dbSplit.host,
    dbPort: outputs.db_port?.value ?? dbSplit.port,
    dbUser: outputs.db_username?.value,
    dbPassword: outputs.db_password?.value,
    dbName: outputs.db_identifier?.value,
    valkeyHost: valkeyEndpoint?.address,
    valkeyPort: valkeyEndpoint?.port,
    valkeyUser: outputs.valkey_user?.value,
    valkeyPassword: outputs.valkey_password?.value,
    sshKeyPem: outputs.caritas_private_key_pem?.value,
    sshKeyName: outputs.caritas_key_pair_name?.value,
  }
}

function normalizePem(pem: string): string {
  const normalized = pem.replace(/\r?\n/g, '\n')
  return normalized.endsWith('\n') ? normalized : `${normalized}\n`
}

async function loadSnapshotsFromState(): Promise<InfraSnapshots> {
  const stateModule = await import('../infra/terraform/terraform.tfstate', {
    with: { type: 'json' },
  })
  const state = (stateModule.default ?? stateModule) as TerraformState
  if (!state.outputs) {
    throw new Error(
      'El archivo terraform.tfstate no contiene outputs disponibles',
    )
  }
  return extractInfra(state.outputs)
}

async function collectInventoryConfig(
  helpers: PromptHelpers,
  snapshots: InfraSnapshots,
): Promise<InventoryConfig> {
  const hostsPath = await helpers.askRequired(
    'Ruta para hosts.ini',
    'infra/ansible/hosts.ini',
  )
  const overwriteHosts = existsSync(hostsPath)
    ? await helpers.askYesNo(
        `El archivo ${hostsPath} ya existe. ¿Deseas sobrescribirlo?`,
        false,
      )
    : true
  if (!overwriteHosts) {
    throw new Error('Operación cancelada: no se sobrescribió hosts.ini')
  }
  const serverAlias = await helpers.askRequired(
    'Alias del servidor',
    snapshots.publicDns ?? 'caritas-app',
  )
  const serverIp = await helpers.askRequired(
    'IP pública del servidor',
    snapshots.publicIp ?? '',
  )
  const serverDns = await helpers.askRequired(
    'DNS público del servidor',
    snapshots.publicDns ?? snapshots.publicIp ?? serverIp,
  )
  return { hostsPath, serverAlias, serverIp, serverDns }
}

async function collectSshConfig(
  helpers: PromptHelpers,
  snapshots: InfraSnapshots,
): Promise<SshConfig> {
  const sshUser = await helpers.askRequired('Usuario SSH', 'ubuntu')
  const defaultKeyName = snapshots.sshKeyName
    ? `${snapshots.sshKeyName}.pem`
    : 'caritas-app-key.pem'
  const defaultKeyPath = snapshots.sshKeyPem
    ? join(process.cwd(), 'infra', 'terraform', defaultKeyName)
    : undefined
  const sshKeyAnswer = await helpers.askRequired(
    'Ruta para la llave SSH (se generará si proviene de Terraform)',
    defaultKeyPath,
  )
  const sshKeyPath = helpers.resolveAbsolute(sshKeyAnswer)
  let sshKeyContent: string | undefined
  if (snapshots.sshKeyPem) {
    const pemWithNewline = normalizePem(snapshots.sshKeyPem)
    const keyExists = existsSync(sshKeyPath)
    const shouldWrite = keyExists
      ? await helpers.askYesNo(
          `La llave ${sshKeyPath} ya existe. ¿Deseas sobrescribirla con la generada por Terraform?`,
          false,
        )
      : true
    if (shouldWrite) {
      sshKeyContent = pemWithNewline
    } else if (!keyExists) {
      throw new Error(
        `No se detectó una llave SSH en ${sshKeyPath}. No es posible continuar sin crear o proporcionar una llave válida.`,
      )
    }
  } else if (!existsSync(sshKeyPath)) {
    throw new Error(
      `Terraform no proporcionó una llave SSH y el archivo ${sshKeyPath} no existe. Proporciona una ruta válida antes de continuar.`,
    )
  }
  const sshPort = await helpers.askNumber('Puerto SSH', 22)
  return { sshUser, sshKeyPath, sshKeyContent, sshPort }
}

async function collectEnvConfig(
  helpers: PromptHelpers,
  snapshots: InfraSnapshots,
): Promise<EnvConfig> {
  const envPath = await helpers.askRequired(
    'Ruta para el archivo .env',
    'apps/api/.env.production',
  )
  const overwriteEnv = existsSync(envPath)
    ? await helpers.askYesNo(
        `El archivo ${envPath} ya existe. ¿Deseas sobrescribirlo?`,
        false,
      )
    : true
  if (!overwriteEnv) {
    throw new Error('Operación cancelada: no se sobrescribió .env')
  }

  const apiPort = await helpers.ask('Puerto de la API', '8000')
  const nodeEnv = await helpers.ask('NODE_ENV', 'production')
  const betterAuthSecret = await helpers.ask(
    'BETTER_AUTH_SECRET',
    randomBytes(32).toString('hex'),
  )
  const defaultAuthUrl = snapshots.publicDns
    ? `https://${snapshots.publicDns}`
    : 'https://tu-dominio'
  const betterAuthUrl = await helpers.ask('BETTER_AUTH_URL', defaultAuthUrl)
  const dbName = await helpers.ask(
    'Nombre de la base de datos',
    snapshots.dbName ?? 'caritasdb',
  )
  const dbHost = await helpers.askRequired(
    'Host de la base de datos',
    snapshots.dbHost ?? '',
  )
  const dbPort = await helpers.ask(
    'Puerto de la base de datos',
    String(snapshots.dbPort ?? 5432),
  )
  const dbUser = await helpers.askRequired(
    'Usuario de la base de datos',
    snapshots.dbUser ?? '',
  )
  const dbPassword = await helpers.askRequired(
    'Password de la base de datos',
    snapshots.dbPassword ?? '',
  )
  const googleClientId = await helpers.ask('GOOGLE_CLIENT_ID', '')
  const googleClientSecret = await helpers.ask('GOOGLE_CLIENT_SECRET', '')
  const googleSmtpUser = await helpers.ask('GOOGLE_SMTP_USER', '')
  const googleSmtpAppPassword = await helpers.ask(
    'GOOGLE_SMTP_APP_PASSWORD',
    '',
  )
  const cloudfareTurnstileSecretKey = await helpers.ask(
    'CLOUDFARE_TURNSTILE_SECRET_KEY',
    '',
  )
  const valkeyHost = await helpers.askRequired(
    'Host de Valkey',
    snapshots.valkeyHost ?? '',
  )
  const valkeyPort = await helpers.ask(
    'Puerto de Valkey',
    String(snapshots.valkeyPort ?? 6379),
  )
  const valkeyUser = await helpers.askRequired(
    'Usuario de Valkey',
    snapshots.valkeyUser ?? '',
  )
  const valkeyPassword = await helpers.askRequired(
    'Password de Valkey',
    snapshots.valkeyPassword ?? '',
  )
  const valkeyDb = await helpers.ask('Número de base de datos de Valkey', '0')

  const databaseUrl = `postgresql://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPassword)}@${dbHost}:${dbPort}/${dbName}`
  const valkeyUrl = `valkey://${encodeURIComponent(valkeyUser)}:${encodeURIComponent(valkeyPassword)}@${valkeyHost}:${valkeyPort}/${valkeyDb}`

  return {
    envPath,
    envValues: {
      port: apiPort,
      nodeEnv,
      betterAuthSecret,
      betterAuthUrl,
      databaseUrl,
      valkeyUrl,
      googleClientId,
      googleClientSecret,
      googleSmtpUser,
      googleSmtpAppPassword,
      cloudfareTurnstileSecretKey,
    },
  }
}

async function ensureDirectory(path: string): Promise<void> {
  const targetDir = dirname(path)
  if (existsSync(targetDir)) return
  await mkdir(targetDir, { recursive: true })
}

function serializeEnv(env: EnvValues): string {
  const entries: Array<[string, string]> = [
    ['PORT', env.port],
    ['NODE_ENV', env.nodeEnv],
    ['BETTER_AUTH_SECRET', env.betterAuthSecret],
    ['BETTER_AUTH_URL', env.betterAuthUrl],
    ['DATABASE_URL', env.databaseUrl],
    ['VALKEY_URL', env.valkeyUrl],
    ['GOOGLE_CLIENT_ID', env.googleClientId],
    ['GOOGLE_CLIENT_SECRET', env.googleClientSecret],
    ['GOOGLE_SMTP_USER', env.googleSmtpUser],
    ['GOOGLE_SMTP_APP_PASSWORD', env.googleSmtpAppPassword],
    ['CLOUDFARE_TURNSTILE_SECRET_KEY', env.cloudfareTurnstileSecretKey],
  ]
  return entries
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')
    .concat('\n')
}

function wrapPath(value: string): string {
  if (value.includes(' ')) return `"${value}"`
  return value
}

async function writeHosts(config: InstallConfig): Promise<void> {
  await ensureDirectory(config.hostsPath)
  const keyPath = wrapPath(config.sshKeyPath)
  const content = `[vps]
${config.serverAlias} ansible_host=${config.serverIp} ansible_user=${config.sshUser} ansible_port=${config.sshPort} ansible_ssh_private_key_file=${keyPath} public_dns=${config.serverDns}

[all:vars]
ansible_python_interpreter=/usr/bin/python3
`
  await writeFile(config.hostsPath, content, 'utf8')
}

async function writeEnv(config: InstallConfig): Promise<void> {
  await ensureDirectory(config.envPath)
  const content = serializeEnv(config.envValues)
  await writeFile(config.envPath, content, 'utf8')
}

async function writeSshKey(config: InstallConfig): Promise<void> {
  if (!config.sshKeyContent) return
  await ensureDirectory(config.sshKeyPath)
  await writeFile(config.sshKeyPath, config.sshKeyContent, 'utf8')
  await chmod(config.sshKeyPath, 0o600).catch(() => {})
}

async function askConfig(snapshots: InfraSnapshots): Promise<InstallConfig> {
  const rl = createInterface({ input, output })
  const ask = async (label: string, fallback?: string) => {
    const suffix = fallback ? ` (${fallback})` : ''
    const answer = (await rl.question(`${label}${suffix}: `)).trim()
    if (answer.length === 0 && fallback !== undefined) return fallback
    return answer
  }
  const askRequired = async (label: string, fallback?: string) => {
    while (true) {
      const response = await ask(label, fallback)
      if (response.length > 0) return response
      console.log('Este campo es obligatorio')
    }
  }
  const askNumber = async (label: string, fallback: number) => {
    while (true) {
      const response = await ask(label, String(fallback))
      const parsed = Number.parseInt(response, 10)
      if (!Number.isNaN(parsed) && parsed > 0) return parsed
      console.log('Introduce un número válido')
    }
  }
  const askYesNo = async (label: string, fallback = false) => {
    const hint = fallback ? 'Y/n' : 'y/N'
    const response = (await ask(label, hint)).toLowerCase()
    if (!response) return fallback
    if (response.startsWith('y')) return true
    if (response.startsWith('n')) return false
    return fallback
  }
  const resolveAbsolute = (value: string) =>
    isAbsolute(value) ? value : resolve(process.cwd(), value)
  const helpers: PromptHelpers = {
    ask,
    askRequired,
    askNumber,
    askYesNo,
    resolveAbsolute,
  }

  try {
    console.log('\nConfiguración de inventario Ansible')
    const inventory = await collectInventoryConfig(helpers, snapshots)
    console.log('\nConfiguración de acceso SSH')
    const ssh = await collectSshConfig(helpers, snapshots)
    console.log('\nConfiguración de variables de entorno de la API')
    const env = await collectEnvConfig(helpers, snapshots)

    return {
      hostsPath: inventory.hostsPath,
      envPath: env.envPath,
      serverAlias: inventory.serverAlias,
      serverIp: inventory.serverIp,
      serverDns: inventory.serverDns,
      sshUser: ssh.sshUser,
      sshKeyPath: ssh.sshKeyPath,
      sshPort: ssh.sshPort,
      sshKeyContent: ssh.sshKeyContent,
      envValues: env.envValues,
    }
  } finally {
    rl.close()
  }
}

async function configureLocalArtifacts(): Promise<void> {
  console.log('Obteniendo salidas de Terraform...')
  const snapshots = await loadSnapshotsFromState()
  console.log('Salidas de Terraform listas')
  const config = await askConfig(snapshots)
  if (config.sshKeyContent) {
    console.log('Guardando llave privada SSH generada por Terraform...')
    await writeSshKey(config)
  }
  console.log('Generando hosts.ini...')
  await writeHosts(config)
  console.log(`Inventario guardado en ${config.hostsPath}`)
  console.log('Generando archivo .env...')
  await writeEnv(config)
  console.log(`Archivo .env guardado en ${config.envPath}`)
  const absoluteHosts = isAbsolute(config.hostsPath)
    ? config.hostsPath
    : resolve(process.cwd(), config.hostsPath)
  const hostsArg = wrapPath(absoluteHosts)
  console.log('\nManual de continuación:')
  console.log(`ansible-playbook -i ${hostsArg} infra/ansible/playbook.yml`)
  console.log(
    'Ejecuta el comando anterior cuando estés listo para continuar con Ansible.',
  )
}

function buildTerraformEnv(config: DeployConfig): Record<string, string> {
  return {
    TF_VAR_aws_region: config.awsRegion,
    TF_VAR_elastic_ip_allocation_id: config.elasticIpAllocationId,
    TF_VAR_allowed_inbound_cidr_blocks: JSON.stringify(config.allowedCidrs),
    TF_VAR_app_ami_id: config.appAmiId,
    TF_VAR_app_instance_type: config.appInstanceType,
    TF_VAR_app_root_volume_size: String(config.appRootVolumeSize),
    TF_VAR_db_engine_version: config.dbEngineVersion,
    TF_VAR_db_instance_class: config.dbInstanceClass,
    TF_VAR_db_allocated_storage: String(config.dbAllocatedStorage),
    TF_VAR_db_max_allocated_storage: String(config.dbMaxAllocatedStorage),
    TF_VAR_db_username: config.dbUsername,
  }
}

function buildAwsEnv(config: DeployConfig): Record<string, string> {
  const env: Record<string, string> = {}
  if (config.awsAccessKeyId) env.AWS_ACCESS_KEY_ID = config.awsAccessKeyId
  if (config.awsSecretAccessKey)
    env.AWS_SECRET_ACCESS_KEY = config.awsSecretAccessKey
  if (config.awsSessionToken) env.AWS_SESSION_TOKEN = config.awsSessionToken
  return env
}

async function grabConfig(): Promise<DeployConfig> {
  const rl = createInterface({ input, output })
  const basicAsk = async (label: string, fallback?: string) => {
    const hint = fallback ? ` (${fallback})` : ' (required)'
    const answer = (await rl.question(`${label}${hint}: `)).trim()
    if (answer.length === 0 && fallback !== undefined) return fallback
    return answer
  }
  const optionalAsk = async (label: string) => {
    const answer = (
      await rl.question(`${label} (leave empty to reuse env): `)
    ).trim()
    return answer
  }

  try {
    const awsRegion = await basicAsk('AWS region', 'us-east-1')
    const awsAccessKeyId = await optionalAsk('AWS access key id')
    const awsSecretAccessKey = await optionalAsk('AWS secret access key')
    const awsSessionToken = await optionalAsk('AWS session token')
    const elasticIpAllocationId = await basicAsk('Elastic IP allocation id')
    if (!elasticIpAllocationId) {
      console.error('Need an Elastic IP allocation id to continue')
      process.exit(1)
    }
    const allowedInput = await basicAsk(
      'Allowed inbound CIDRs comma separated',
      '0.0.0.0/0',
    )
    const allowedCidrs = allowedInput
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
    const appAmiId = await basicAsk('App AMI id', 'ami-0360c520857e3138f')
    const appInstanceType = await basicAsk('App instance type', 't2.medium')
    const appRootVolumeSizeRaw = await basicAsk('App root volume size', '20')
    const dbEngineVersion = await basicAsk('DB engine version', '17.4')
    const dbInstanceClass = await basicAsk('DB instance class', 'db.t4g.micro')
    const dbAllocatedStorageRaw = await basicAsk('DB allocated storage', '20')
    const dbMaxAllocatedStorageRaw = await basicAsk(
      'DB max allocated storage',
      '100',
    )
    const dbUsername = await basicAsk('DB username', 'caritasdb')
    const runApplyInput = await basicAsk(
      'Run terraform apply after plan? (y/N)',
      'n',
    )
    const runApply = runApplyInput.toLowerCase().startsWith('y')

    return {
      awsRegion,
      awsAccessKeyId,
      awsSecretAccessKey,
      awsSessionToken,
      elasticIpAllocationId,
      allowedCidrs,
      appAmiId,
      appInstanceType,
      appRootVolumeSize: parseNumberish(appRootVolumeSizeRaw, 20),
      dbEngineVersion,
      dbInstanceClass,
      dbAllocatedStorage: parseNumberish(dbAllocatedStorageRaw, 20),
      dbMaxAllocatedStorage: parseNumberish(dbMaxAllocatedStorageRaw, 100),
      dbUsername,
      runApply,
    }
  } finally {
    rl.close()
  }
}

async function deployInfrastructure() {
  ensureRepoRoot()
  console.log('🚀 Estableciendo la infraestructura en la nube de AWS...')
  const config = await grabConfig()
  const tfEnv = buildTerraformEnv(config)
  const awsEnv = buildAwsEnv(config)
  const commandEnv = { ...tfEnv, ...awsEnv }

  try {
    console.log('🔧 Preparando Terraform...')
    await runCommand('terraform init', 'infra/terraform', commandEnv)
    console.log('🧮 Calculando plan medio improvisado...')
    await runCommand('terraform plan', 'infra/terraform', commandEnv)
    if (config.runApply) {
      console.log('⚙️ Mandando terraform apply como campeones...')
      await runCommand(
        'terraform apply -auto-approve',
        'infra/terraform',
        commandEnv,
      )
      console.log(
        '✅ Infra desplegada. Revisa los outputs con terraform output si quieres verlos con calma.',
      )
    } else {
      console.log(
        '⏸️ Plan listo, no se aplicó nada. Corre de nuevo y di que sí si quieres aplicar.',
      )
    }
    const statePath = resolve(
      process.cwd(),
      'infra',
      'terraform',
      'terraform.tfstate',
    )
    if (existsSync(statePath)) {
      await configureLocalArtifacts()
    } else {
      console.log(
        'No se encontraron outputs de Terraform, se omitirá la configuración local.',
      )
    }
  } catch (error) {
    console.error('💥 Algo se rompió durante el despliegue', error)
    throw error
  }
}

deployInfrastructure().catch((error) => {
  console.error('❗️ Deploy falló, revisa los mensajes de arriba', error)
  process.exit(1)
})
