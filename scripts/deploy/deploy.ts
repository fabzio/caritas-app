import crypto from 'node:crypto'
import dns from 'node:dns/promises'
import { constants } from 'node:fs'
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { parse as parseDotenv } from 'dotenv'
import { execa } from 'execa'
import kleur from 'kleur'
import ora from 'ora'
import prompts from 'prompts'

type BackendEnv = {
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL: string
  CLOUDFARE_TURNSTILE_SECRET_KEY: string
  DATABASE_URL: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET?: string
  GOOGLE_SMTP_APP_PASSWORD: string
  GOOGLE_SMTP_USER: string
  NODE_ENV: 'production'
  PORT: string
  VALKEY_URL?: string
}

type FrontendEnv = {
  VITE_API_URL: string
  VITE_APP_TITLE: string
  VITE_CLOUDFARE_TURNSTILE_SITE_KEY: string
  VITE_GOOGLE_CLIENT_ID: string
  VITE_ORG_NAME: string
}

type TerraformOutputs = {
  instance_public_ip: string
  instance_private_ip: string
  db_username: string
  db_password: string
  db_endpoint: string
  db_port: number
  db_name: string
  ssh_user: string
}

type AwsCredentials = {
  accessKeyId?: string
  secretAccessKey?: string
  sessionToken?: string
  profile?: string
  region: string
}

type DeploymentInput = {
  domain: string
  email: string
  elasticIpAllocationId: string
  sshKeyName: string
  sshPublicKeyPath: string
  sshPrivateKeyPath: string
  sshUser: string
  allowedSshCidr: string
  githubUsername: string
  githubToken: string
  aws: AwsCredentials
  backendEnv: BackendEnv
  frontendEnv: FrontendEnv
}

const scriptPath = process.argv[1]
  ? resolve(process.argv[1])
  : resolve(process.cwd(), 'scripts/deploy/deploy.ts')
const deployRoot = dirname(scriptPath)
const repoRoot = resolve(deployRoot, '..', '..')
const generatedDir = join(deployRoot, '.generated')

const ascii = kleur.bold().magenta(
  `
 ██████╗ █████╗ ██████╗ ██╗████████╗ █████╗ ███████╗
██╔════╝██╔══██╗██╔══██╗██║╚══██╔══╝██╔══██╗██╔════╝
██║     ███████║██████╔╝██║   ██║   ███████║███████╗
██║     ██╔══██║██╔══██╗██║   ██║   ██╔══██║╚════██║
╚██████╗██║  ██║██║  ██║██║   ██║   ██║  ██║███████║
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝
`.trimEnd(),
)

const toEnvContent = (entries: Record<string, string>) =>
  Object.entries(entries)
    .map(([key, value]) => `${key}=${formatEnvValue(value)}`)
    .join('\n') + '\n'

const formatEnvValue = (value: string) => {
  if (value === '') {
    return ''
  }
  if (/^[A-Za-z0-9_.:@/-]+$/.test(value)) {
    return value
  }
  const escaped = value.replace(/"/g, '\\"').replace(/\n/g, '\\n')
  return `"${escaped}"`
}

const sanitizeEnvContent = (raw: string) =>
  raw
    .split(/\r?\n/)
    .map((line) => {
      if (!line.includes('=') && line.includes(':')) {
        const segments = line.split(':')
        const key = segments.shift()
        const value = segments.join(':')
        if (!key) {
          return line
        }
        return `${key.trim()}=${value.trim()}`
      }
      return line
    })
    .join('\n')

const loadEnvFile = async (filePath: string) => {
  const content = await readFile(filePath, 'utf8')
  const parsed = parseDotenv(sanitizeEnvContent(content))
  return parsed
}

const ensureFile = async (filePath: string) => {
  await access(filePath, constants.F_OK)
}

const ensureCommand = async (command: string) => {
  await execa(command, ['-v'])
}

const createSpinner = (message: string) =>
  ora({ text: message, spinner: 'bouncingBar' })

const promptAbort = () => {
  console.log(kleur.red('Abortado por el usuario.'))
  process.exit(1)
}

const toPosixPath = (value: string) => value.replace(/\\/g, '/')

const promptDomainAndEmail = async () => {
  const answers = await prompts(
    [
      {
        type: 'text',
        name: 'domain',
        message: 'Dominio principal',
        validate: (value: string) =>
          value.trim().length > 0 && value.includes('.')
            ? true
            : 'Ingresa un dominio válido',
      },
      {
        type: 'text',
        name: 'email',
        message: 'Email para certificados SSL',
        validate: (value: string) =>
          /^\S+@\S+\.\S+$/.test(value) ? true : 'Ingresa un correo válido',
      },
    ],
    {
      onCancel: promptAbort,
    },
  )
  return answers as { domain: string; email: string }
}

const promptEnvSource = async () => {
  const answer = await prompts(
    {
      type: 'toggle',
      name: 'fromFile',
      message: '¿Cargar variables desde un archivo .env existente?',
      active: 'sí',
      inactive: 'no',
    },
    { onCancel: promptAbort },
  )
  if (!answer.fromFile) {
    return undefined
  }
  const { filePath } = await prompts(
    {
      type: 'text',
      name: 'filePath',
      message: 'Ruta del archivo .env',
      initial: join(repoRoot, 'apps', 'api', '.env.development'),
      validate: async (value: string) => {
        try {
          await ensureFile(resolve(value))
          return true
        } catch {
          return 'No se puede leer el archivo indicado'
        }
      },
    },
    { onCancel: promptAbort },
  )
  return resolve(filePath as string)
}

const promptBackendEnv = async (
  defaults: Record<string, string>,
  domain: string,
) => {
  const secretDefault =
    defaults.BETTER_AUTH_SECRET ?? crypto.randomBytes(48).toString('base64url')
  const answers = await prompts(
    [
      {
        type: 'text',
        name: 'BETTER_AUTH_SECRET',
        message: 'BETTER_AUTH_SECRET',
        initial: secretDefault,
        validate: (value: string) =>
          value.length >= 32 ? true : 'Debe tener al menos 32 caracteres',
      },
      {
        type: 'text',
        name: 'GOOGLE_CLIENT_ID',
        message: 'GOOGLE_CLIENT_ID',
        initial: defaults.GOOGLE_CLIENT_ID,
        validate: (value: string) =>
          value.trim().length > 0 ? true : 'Requerido',
      },
      {
        type: 'text',
        name: 'GOOGLE_CLIENT_SECRET',
        message: 'GOOGLE_CLIENT_SECRET (opcional)',
        initial: defaults.GOOGLE_CLIENT_SECRET ?? '',
      },
      {
        type: 'text',
        name: 'GOOGLE_SMTP_USER',
        message: 'GOOGLE_SMTP_USER',
        initial: defaults.GOOGLE_SMTP_USER ?? '',
        validate: (value: string) =>
          value.trim().length > 0 ? true : 'Requerido',
      },
      {
        type: 'password',
        name: 'GOOGLE_SMTP_APP_PASSWORD',
        message: 'GOOGLE_SMTP_APP_PASSWORD',
        initial: defaults.GOOGLE_SMTP_APP_PASSWORD ?? '',
        validate: (value: string) =>
          value.trim().length > 0 ? true : 'Requerido',
      },
      {
        type: 'text',
        name: 'CLOUDFARE_TURNSTILE_SECRET_KEY',
        message: 'CLOUDFARE_TURNSTILE_SECRET_KEY',
        initial: defaults.CLOUDFARE_TURNSTILE_SECRET_KEY ?? '',
        validate: (value: string) =>
          value.trim().length > 0 ? true : 'Requerido',
      },
      {
        type: 'text',
        name: 'VALKEY_URL',
        message: 'VALKEY_URL (opcional)',
        initial: defaults.VALKEY_URL ?? '',
      },
    ],
    { onCancel: promptAbort },
  )
  const backendEnv: BackendEnv = {
    BETTER_AUTH_SECRET: answers.BETTER_AUTH_SECRET as string,
    BETTER_AUTH_URL: `https://${domain}`,
    CLOUDFARE_TURNSTILE_SECRET_KEY:
      answers.CLOUDFARE_TURNSTILE_SECRET_KEY as string,
    DATABASE_URL: '',
    GOOGLE_CLIENT_ID: answers.GOOGLE_CLIENT_ID as string,
    GOOGLE_CLIENT_SECRET: (
      answers.GOOGLE_CLIENT_SECRET as string | undefined
    )?.trim().length
      ? (answers.GOOGLE_CLIENT_SECRET as string).trim()
      : undefined,
    GOOGLE_SMTP_APP_PASSWORD: answers.GOOGLE_SMTP_APP_PASSWORD as string,
    GOOGLE_SMTP_USER: answers.GOOGLE_SMTP_USER as string,
    NODE_ENV: 'production',
    PORT: '8000',
    VALKEY_URL: (answers.VALKEY_URL as string | undefined)?.trim().length
      ? (answers.VALKEY_URL as string).trim()
      : undefined,
  }
  return backendEnv
}

const promptFrontendEnv = async (
  defaults: Record<string, string>,
  domain: string,
  backend: BackendEnv,
) => {
  const answers = await prompts(
    [
      {
        type: 'text',
        name: 'VITE_APP_TITLE',
        message: 'VITE_APP_TITLE',
        initial: defaults.VITE_APP_TITLE ?? 'Cáritas Lima 365',
      },
      {
        type: 'text',
        name: 'VITE_ORG_NAME',
        message: 'VITE_ORG_NAME',
        initial: defaults.VITE_ORG_NAME ?? 'Cáritas Lima',
      },
      {
        type: 'text',
        name: 'VITE_GOOGLE_CLIENT_ID',
        message: 'VITE_GOOGLE_CLIENT_ID',
        initial: defaults.VITE_GOOGLE_CLIENT_ID ?? backend.GOOGLE_CLIENT_ID,
        validate: (value: string) =>
          value.trim().length > 0 ? true : 'Requerido',
      },
      {
        type: 'text',
        name: 'VITE_CLOUDFARE_TURNSTILE_SITE_KEY',
        message: 'VITE_CLOUDFARE_TURNSTILE_SITE_KEY',
        initial: defaults.VITE_CLOUDFARE_TURNSTILE_SITE_KEY ?? '',
        validate: (value: string) =>
          value.trim().length > 0 ? true : 'Requerido',
      },
    ],
    { onCancel: promptAbort },
  )
  const frontendEnv: FrontendEnv = {
    VITE_API_URL: `https://${domain}`,
    VITE_APP_TITLE: (answers.VITE_APP_TITLE as string).trim(),
    VITE_CLOUDFARE_TURNSTILE_SITE_KEY: (
      answers.VITE_CLOUDFARE_TURNSTILE_SITE_KEY as string
    ).trim(),
    VITE_GOOGLE_CLIENT_ID: (answers.VITE_GOOGLE_CLIENT_ID as string).trim(),
    VITE_ORG_NAME: (answers.VITE_ORG_NAME as string).trim(),
  }
  return frontendEnv
}

const promptAws = async (): Promise<AwsCredentials> => {
  const regionAnswer = await prompts(
    {
      type: 'text',
      name: 'region',
      message: 'AWS Region',
      initial: 'us-east-1',
      validate: (value: string) =>
        value.trim().length > 0 ? true : 'Requerido',
    },
    { onCancel: promptAbort },
  )
  const profileAnswer = await prompts(
    {
      type: 'text',
      name: 'profile',
      message: 'AWS Profile (dejar vacío para usar claves)',
    },
    { onCancel: promptAbort },
  )
  if ((profileAnswer.profile as string | undefined)?.trim()) {
    return {
      profile: (profileAnswer.profile as string).trim(),
      region: (regionAnswer.region as string).trim(),
    }
  }
  const keys = await prompts(
    [
      {
        type: 'text',
        name: 'accessKeyId',
        message: 'AWS Access Key ID',
        validate: (value: string) =>
          value.trim().length > 0 ? true : 'Requerido',
      },
      {
        type: 'password',
        name: 'secretAccessKey',
        message: 'AWS Secret Access Key',
        validate: (value: string) =>
          value.trim().length > 0 ? true : 'Requerido',
      },
      {
        type: 'password',
        name: 'sessionToken',
        message: 'AWS Session Token (opcional)',
      },
    ],
    { onCancel: promptAbort },
  )
  return {
    accessKeyId: (keys.accessKeyId as string).trim(),
    secretAccessKey: (keys.secretAccessKey as string).trim(),
    sessionToken: (keys.sessionToken as string)?.trim() || undefined,
    region: (regionAnswer.region as string).trim(),
  }
}

const promptTerraformExtras = async () => {
  const answers = await prompts(
    [
      {
        type: 'text',
        name: 'elasticIpAllocationId',
        message: 'Elastic IP Allocation ID',
        validate: (value: string) =>
          value.startsWith('eipalloc-')
            ? true
            : 'Debe iniciar con eipalloc-...',
      },
      {
        type: 'text',
        name: 'sshKeyName',
        message: 'Nombre para el key pair en AWS',
        initial: 'caritas-deploy',
        validate: (value: string) =>
          value.trim().length > 0 ? true : 'Requerido',
      },
      {
        type: 'text',
        name: 'sshPublicKeyPath',
        message: 'Ruta al archivo de llave pública SSH',
        initial: join(process.cwd(), 'id_rsa.pub'),
        validate: async (value: string) => {
          try {
            await ensureFile(resolve(value))
            return true
          } catch {
            return 'No se puede leer la llave pública'
          }
        },
      },
      {
        type: 'text',
        name: 'sshPrivateKeyPath',
        message: 'Ruta al archivo de llave privada SSH',
        initial: join(process.cwd(), 'id_rsa'),
        validate: async (value: string) => {
          try {
            await ensureFile(resolve(value))
            return true
          } catch {
            return 'No se puede leer la llave privada'
          }
        },
      },
      {
        type: 'text',
        name: 'sshUser',
        message: 'Usuario SSH para la instancia',
        initial: 'ubuntu',
      },
      {
        type: 'text',
        name: 'allowedSshCidr',
        message: 'CIDR permitido para SSH',
        initial: '0.0.0.0/0',
      },
    ],
    { onCancel: promptAbort },
  )
  return {
    elasticIpAllocationId: (answers.elasticIpAllocationId as string).trim(),
    sshKeyName: (answers.sshKeyName as string).trim(),
    sshPublicKeyPath: resolve(answers.sshPublicKeyPath as string),
    sshPrivateKeyPath: resolve(answers.sshPrivateKeyPath as string),
    sshUser: (answers.sshUser as string).trim(),
    allowedSshCidr: (answers.allowedSshCidr as string).trim(),
  }
}

const promptGithub = async () => {
  const answers = await prompts(
    [
      {
        type: 'text',
        name: 'githubUsername',
        message: 'Usuario de GitHub para GHCR',
        validate: (value: string) =>
          value.trim().length > 0 ? true : 'Requerido',
      },
      {
        type: 'password',
        name: 'githubToken',
        message: 'Token de GitHub para GHCR',
        validate: (value: string) =>
          value.trim().length > 0 ? true : 'Requerido',
      },
    ],
    { onCancel: promptAbort },
  )
  return {
    githubUsername: (answers.githubUsername as string).trim(),
    githubToken: (answers.githubToken as string).trim(),
  }
}

const readFileOrEmpty = async (path: string | undefined) => {
  if (!path) {
    return {}
  }
  return loadEnvFile(path)
}

const removeIfExists = async (path: string) => {
  try {
    await rm(path, { recursive: true, force: true })
  } catch {
    return
  }
}

const ensureGeneratedDir = async () => {
  await removeIfExists(generatedDir)
  await mkdir(generatedDir, { recursive: true })
}

const buildDeploymentInput = async (): Promise<DeploymentInput> => {
  console.log(ascii)
  console.log(kleur.bgBlack().green('  Hack the planet, deploy Cáritas  '))
  const domainAndEmail = await promptDomainAndEmail()
  const envPath = await promptEnvSource()
  const defaults = await readFileOrEmpty(envPath)
  const backendEnv = await promptBackendEnv(defaults, domainAndEmail.domain)
  const frontendEnv = await promptFrontendEnv(
    defaults,
    domainAndEmail.domain,
    backendEnv,
  )
  const aws = await promptAws()
  const terraformExtras = await promptTerraformExtras()
  const github = await promptGithub()
  return {
    domain: domainAndEmail.domain,
    email: domainAndEmail.email,
    elasticIpAllocationId: terraformExtras.elasticIpAllocationId,
    sshKeyName: terraformExtras.sshKeyName,
    sshPublicKeyPath: terraformExtras.sshPublicKeyPath,
    sshPrivateKeyPath: terraformExtras.sshPrivateKeyPath,
    sshUser: terraformExtras.sshUser,
    allowedSshCidr: terraformExtras.allowedSshCidr,
    githubUsername: github.githubUsername,
    githubToken: github.githubToken,
    aws,
    backendEnv,
    frontendEnv,
  }
}

const writeTerraformVars = async (input: DeploymentInput) => {
  const vars = {
    project: 'caritas',
    environment: 'production',
    aws_region: input.aws.region,
    instance_type: 't2.medium',
    elastic_ip_allocation_id: input.elasticIpAllocationId,
    ssh_key_name: input.sshKeyName,
    ssh_public_key: (await readFile(input.sshPublicKeyPath, 'utf8')).trim(),
    ssh_user: input.sshUser,
    allowed_ssh_cidr: input.allowedSshCidr,
    db_username: 'caritas_app',
    db_name: 'caritas',
  }
  const content = JSON.stringify(vars, null, 2)
  const filePath = join(generatedDir, 'deployment.auto.tfvars.json')
  await writeFile(filePath, content)
  return filePath
}

const terraformEnv = (input: DeploymentInput) => {
  if (input.aws.profile) {
    return { AWS_PROFILE: input.aws.profile, AWS_REGION: input.aws.region }
  }
  return {
    AWS_ACCESS_KEY_ID: input.aws.accessKeyId ?? '',
    AWS_SECRET_ACCESS_KEY: input.aws.secretAccessKey ?? '',
    ...(input.aws.sessionToken
      ? { AWS_SESSION_TOKEN: input.aws.sessionToken }
      : {}),
    AWS_REGION: input.aws.region,
  }
}

const runTerraform = async (input: DeploymentInput, varsFile: string) => {
  const env = { ...process.env, ...terraformEnv(input) }
  await ensureCommand('terraform')
  await execa('terraform', ['init'], { cwd: deployRoot, stdio: 'inherit', env })
  await execa(
    'terraform',
    ['apply', '-auto-approve', `-var-file=${varsFile}`],
    {
      cwd: deployRoot,
      stdio: 'inherit',
      env,
    },
  )
  const { stdout } = await execa('terraform', ['output', '-json'], {
    cwd: deployRoot,
    env,
  })
  const parsed = JSON.parse(stdout) as Record<string, { value: unknown }>
  const extract = <T>(key: keyof TerraformOutputs): T => parsed[key]?.value as T
  const outputs: TerraformOutputs = {
    instance_public_ip: extract('instance_public_ip'),
    instance_private_ip: extract('instance_private_ip'),
    db_username: extract('db_username'),
    db_password: extract('db_password'),
    db_endpoint: extract('db_endpoint'),
    db_port: extract('db_port'),
    db_name: extract('db_name'),
    ssh_user: extract('ssh_user'),
  }
  return outputs
}

const buildDatabaseUrl = (outputs: TerraformOutputs) =>
  `postgresql://${outputs.db_username}:${encodeURIComponent(outputs.db_password)}@${outputs.db_endpoint}:${outputs.db_port}/${outputs.db_name}`

const createAppBundle = async (
  input: DeploymentInput,
  outputs: TerraformOutputs,
) => {
  const tempRoot = await mkdtemp(join(tmpdir(), 'caritas-deploy-'))
  const appDir = join(tempRoot, 'app')
  await mkdir(appDir, { recursive: true })
  const templateCompose = await readFile(
    join(deployRoot, 'app', 'docker-compose.yml'),
    'utf8',
  )
  await writeFile(join(appDir, 'docker-compose.yml'), templateCompose)
  const composeEnv = {
    DOMAIN: input.domain,
    LETSENCRYPT_EMAIL: input.email,
    API_IMAGE: 'ghcr.io/fabzio/caritas-api:latest',
    FRONTEND_IMAGE: 'ghcr.io/fabzio/caritas-frontend:latest',
  }
  await writeFile(join(appDir, '.env'), toEnvContent(composeEnv))
  const backendEnv: BackendEnv = {
    ...input.backendEnv,
    DATABASE_URL: buildDatabaseUrl(outputs),
  }
  const apiEnvEntries: Record<string, string> = {
    BETTER_AUTH_SECRET: backendEnv.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: backendEnv.BETTER_AUTH_URL,
    CLOUDFARE_TURNSTILE_SECRET_KEY: backendEnv.CLOUDFARE_TURNSTILE_SECRET_KEY,
    DATABASE_URL: backendEnv.DATABASE_URL,
    GOOGLE_CLIENT_ID: backendEnv.GOOGLE_CLIENT_ID,
    GOOGLE_SMTP_USER: backendEnv.GOOGLE_SMTP_USER,
    GOOGLE_SMTP_APP_PASSWORD: backendEnv.GOOGLE_SMTP_APP_PASSWORD,
    NODE_ENV: backendEnv.NODE_ENV,
    PORT: backendEnv.PORT,
  }
  if (backendEnv.GOOGLE_CLIENT_SECRET) {
    apiEnvEntries.GOOGLE_CLIENT_SECRET = backendEnv.GOOGLE_CLIENT_SECRET
  }
  if (backendEnv.VALKEY_URL) {
    apiEnvEntries.VALKEY_URL = backendEnv.VALKEY_URL
  }
  await writeFile(join(appDir, 'api.env'), toEnvContent(apiEnvEntries))
  const frontendEnv: FrontendEnv = { ...input.frontendEnv }
  const frontendEnvEntries: Record<string, string> = {
    VITE_API_URL: frontendEnv.VITE_API_URL,
    VITE_APP_TITLE: frontendEnv.VITE_APP_TITLE,
    VITE_CLOUDFARE_TURNSTILE_SITE_KEY:
      frontendEnv.VITE_CLOUDFARE_TURNSTILE_SITE_KEY,
    VITE_GOOGLE_CLIENT_ID: frontendEnv.VITE_GOOGLE_CLIENT_ID,
    VITE_ORG_NAME: frontendEnv.VITE_ORG_NAME,
  }
  await writeFile(
    join(appDir, 'frontend.env'),
    toEnvContent(frontendEnvEntries),
  )
  return { tempRoot, appDir }
}

const createInventory = async (
  input: DeploymentInput,
  outputs: TerraformOutputs,
) => {
  const inventoryPath = join(generatedDir, 'inventory.ini')
  const privateKey = input.sshPrivateKeyPath.replace(/\\/g, '\\\\')
  const inventoryLine = `${outputs.instance_public_ip} ansible_host=${outputs.instance_public_ip} ansible_user=${input.sshUser} ansible_ssh_private_key_file="${privateKey}" ansible_ssh_common_args='-o StrictHostKeyChecking=no'`
  const lines = ['[vps]', inventoryLine]
  await writeFile(inventoryPath, lines.join('\n') + '\n')
  return inventoryPath
}

const runAnsible = async (
  inventory: string,
  input: DeploymentInput,
  appDir: string,
) => {
  await ensureCommand('ansible-playbook')
  const env = { ...process.env, ANSIBLE_HOST_KEY_CHECKING: 'false' }
  await execa('ansible-playbook', ['-i', inventory, 'playbook.yml'], {
    cwd: join(deployRoot, 'ansible'),
    stdio: 'inherit',
    env,
  })
  await execa(
    'ansible-playbook',
    [
      '-i',
      inventory,
      'app.yml',
      '-e',
      `github_username=${input.githubUsername}`,
      '-e',
      `github_token=${input.githubToken}`,
      '-e',
      `app_src_path=${toPosixPath(appDir)}`,
    ],
    {
      cwd: join(deployRoot, 'ansible'),
      stdio: 'inherit',
      env,
    },
  )
  await execa('ansible-playbook', ['-i', inventory, 'playbook.yml'], {
    cwd: join(deployRoot, 'ansible'),
    stdio: 'inherit',
    env,
  })
}

const verifyDns = async (domain: string, expectedIp: string) => {
  const spinner = createSpinner(`Verificando DNS para ${domain}`)
  spinner.start()
  try {
    const records = await dns.lookup(domain, { all: true })
    const match = records.some((record) => record.address === expectedIp)
    if (!match) {
      spinner.fail()
      throw new Error(
        `El dominio ${domain} no apunta a ${expectedIp}. Registros actuales: ${records.map((r) => r.address).join(', ')}`,
      )
    }
    spinner.succeed()
  } catch (error) {
    spinner.fail()
    throw error
  }
}

const waitForApi = async (domain: string) => {
  const spinner = createSpinner('Esperando a que la API responda')
  spinner.start()
  const url = `https://${domain}/api/v1/regions`
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      const response = await fetch(url, { method: 'GET' })
      if (response.ok) {
        spinner.succeed(`API lista en ${url}`)
        return
      }
    } catch {}
    await new Promise((resolvePromise) =>
      setTimeout(resolvePromise, attempt * 5000),
    )
  }
  spinner.fail()
  throw new Error('La API no respondió a tiempo')
}

const main = async () => {
  await ensureGeneratedDir()
  const input = await buildDeploymentInput()
  const varsFile = await writeTerraformVars(input)
  const outputs = await runTerraform(input, varsFile)
  await verifyDns(input.domain, outputs.instance_public_ip)
  const { tempRoot, appDir } = await createAppBundle(input, outputs)
  const inventory = await createInventory(input, outputs)
  await runAnsible(inventory, input, appDir)
  await waitForApi(input.domain)
  console.log(kleur.green().bold('✅ Despliegue completado'))
  console.log(kleur.cyan(`Servidor: ${outputs.instance_public_ip}`))
  console.log(
    kleur.cyan(`Base de datos: ${outputs.db_endpoint}:${outputs.db_port}`),
  )
  console.log(kleur.cyan(`DB user: ${outputs.db_username}`))
  console.log(kleur.yellow(`Archivos temporales: ${tempRoot}`))
}

main().catch((error) => {
  console.error(kleur.red().bold('💥 Error durante el despliegue'))
  if (error instanceof Error) {
    console.error(kleur.red(error.message))
  } else {
    console.error(error)
  }
  process.exit(1)
})
