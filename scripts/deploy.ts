#!/usr/bin/env bun

import { exec } from 'node:child_process'
import { stdin as input, stdout as output } from 'node:process'
import { createInterface } from 'node:readline/promises'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

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

async function runCommand(
  command: string,
  cwd?: string,
  extraEnv: Record<string, string> = {},
): Promise<void> {
  try {
    console.log(`Running: ${command}`)
    const { stdout, stderr } = await execAsync(command, {
      cwd,
      env: { ...process.env, ...extraEnv },
    })
    if (stdout) console.log(stdout)
    if (stderr) console.error(stderr)
  } catch (error) {
    console.error(`Error running command: ${command}`, error)
    throw error
  }
}

function parseNumberish(value: string, fallback: number): number {
  const parsed = Number.parseFloat(value)
  if (Number.isNaN(parsed)) return fallback
  return parsed
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
    if (!config.runApply) {
      console.log(
        '⏸️ Plan listo, no se aplicó nada. Corre de nuevo y di que sí si quieres aplicar.',
      )
      return
    }
    console.log('⚙️ Mandando terraform apply como campeones...')
    await runCommand(
      'terraform apply -auto-approve',
      'infra/terraform',
      commandEnv,
    )
    console.log(
      '✅ Infra desplegada. Revisa los outputs con terraform output si quieres verlos con calma.',
    )
  } catch (error) {
    console.error('💥 Algo se rompió durante el despliegue', error)
    throw error
  }
}

deployInfrastructure().catch((error) => {
  console.error('❗️ Deploy falló, revisa los mensajes de arriba', error)
  process.exit(1)
})
