import { type ChildProcess, spawn } from 'node:child_process'
import { stdin as input, stdout as output } from 'node:process'
import type { Interface } from 'node:readline/promises'
import { createInterface } from 'node:readline/promises'
import db, { schema } from '@api/db'
import { auth } from '@api/lib/auth'
import { fakerES as faker } from '@faker-js/faker'
import { count, eq, sql } from 'drizzle-orm'
import { activityStatus, activityTypes } from './entities/activities'
import { districts } from './entities/regions'

const colors = {
  banner: '\x1b[96m',
  accent: '\x1b[92m',
  warning: '\x1b[93m',
  danger: '\x1b[91m',
  reset: '\x1b[0m',
}

const banner = `${colors.banner}
┌────────────────────────────────────────────────────────────┐
│ Cáritas Lima :: Bootstrap Console                          │
├────────────────────────────────────────────────────────────┤
│    boot> seed & reset utility                              │
└────────────────────────────────────────────────────────────┘${colors.reset}`

let schemaVerified = false

type DatabaseStatus = {
  schemas: Array<{ name: string; tables: number }>
  counts: {
    users: number
    organizations: number
    regions: number
  }
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

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

const slugify = (value: string) =>
  normalize(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const pickChars = (source: string, length: number) =>
  Array.from(
    { length },
    () => source[faker.number.int({ min: 0, max: source.length - 1 })],
  )

const runDbPush = async () => {
  console.log(
    `${colors.warning}Applying schema with bun run db:push...${colors.reset}`,
  )
  await runCommand('bun run db:push', process.cwd(), {})
  schemaVerified = false
}

const ensureSchema = async () => {
  if (schemaVerified) return
  const [{ exists }] = await db.execute<{ exists: boolean }>(
    sql`SELECT to_regclass('auth.user') IS NOT NULL AS exists`,
  )
  if (!exists) {
    await runDbPush()
    const [verification] = await db.execute<{ exists: boolean }>(
      sql`SELECT to_regclass('auth.user') IS NOT NULL AS exists`,
    )
    if (!verification?.exists)
      throw new Error('Failed to create database schema')
  }
  schemaVerified = true
}

const createPassword = () => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const seedPool = [
    ...pickChars(uppercase, 5),
    ...pickChars(lowercase, 5),
    ...pickChars(numbers, 3),
  ]
  while (seedPool.length < 13)
    seedPool.push(pickChars(`${uppercase}${lowercase}${numbers}`, 1)[0])
  return faker.helpers.shuffle(seedPool).join('').slice(0, 13)
}

export const seedDistricts = async () => {
  await db
    .insert(schema.region)
    .values(
      districts.map((district) => ({
        name: district.name,
        type: 'district' as const,
        code: district.code,
      })),
    )
    .onConflictDoNothing({ target: schema.region.code })
}
export const seedActivities = async () => {
  await Promise.all([
    db
      .insert(schema.activityType)
      .values(activityTypes.map((type) => ({ name: type }))),
    db
      .insert(schema.activityStatus)
      .values(activityStatus.map((status) => ({ name: status }))),
  ])
}

const resetDatabase = async () => {
  await ensureSchema()
  await db.execute(sql`DROP SCHEMA IF EXISTS education CASCADE`)
  await db.execute(sql`DROP SCHEMA IF EXISTS health CASCADE`)
  await db.execute(sql`DROP SCHEMA IF EXISTS auth CASCADE`)
  schemaVerified = false
  await ensureSchema()
}

const parseCount = (value: unknown) => Number(value ?? 0)

const getDatabaseStatus = async (): Promise<DatabaseStatus> => {
  await ensureSchema()
  const rows = await db.execute<{ name: string; tables: string | number }>(
    sql`SELECT schemaname AS name, COUNT(*) AS tables
        FROM pg_tables
        WHERE schemaname IN ('auth', 'education', 'health')
        GROUP BY schemaname
        ORDER BY schemaname`,
  )
  const schemas = rows.map(
    (row: { name: string; tables: string | number }) => ({
      name: row.name,
      tables: Number(row.tables ?? 0),
    }),
  )
  const [userAggregate] = await db.select({ value: count() }).from(schema.user)
  const [organizationAggregate] = await db
    .select({ value: count() })
    .from(schema.organization)
  const [regionAggregate] = await db
    .select({ value: count() })
    .from(schema.region)
  return {
    schemas,
    counts: {
      users: parseCount(userAggregate?.value),
      organizations: parseCount(organizationAggregate?.value),
      regions: parseCount(regionAggregate?.value),
    },
  }
}

const printStatus = (status: DatabaseStatus) => {
  console.clear()
  console.log(banner)
  console.log(`${colors.accent}\n[ status ]${colors.reset}`)
  status.schemas.forEach((entry) => {
    console.log(
      `  ↳ ${entry.name.padEnd(10)} : ${entry.tables.toString().padStart(2)} tables`,
    )
  })
  console.log(`\n  users          : ${status.counts.users}`)
  console.log(`  organizations  : ${status.counts.organizations}`)
  console.log(`  regions        : ${status.counts.regions}`)
  console.log(`\n${colors.accent}[ menu ]${colors.reset}`)
  console.log('  1) Initialize / bootstrap admin')
  console.log('  2) Nuclear reset')
  console.log('  0) Exit')
}

const ask = async (rl: Interface, prompt: string) => {
  const answer = await rl.question(prompt)
  return answer.trim()
}

const confirm = async (rl: Interface, question: string) => {
  const answer = await ask(
    rl,
    `${question} ${colors.warning}[y/N]${colors.reset} > `,
  )
  return ['y', 'yes'].includes(answer.toLowerCase())
}

const requestEmail = async (rl: Interface) => {
  while (true) {
    const email = await ask(rl, '✉  admin email > ')
    if (!email) continue
    const isValid = /^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(email)
    if (!isValid) {
      console.log(`${colors.warning}Invalid email, try again.${colors.reset}`)
      continue
    }
    const existing = await db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.email, email))
      .limit(1)
    if (existing.length > 0) {
      console.log(
        `${colors.warning}Email already exists in database.${colors.reset}`,
      )
      continue
    }
    return email
  }
}

const chooseRegionId = async () => {
  await seedDistricts()
  const regions = await db
    .select({ id: schema.region.id })
    .from(schema.region)
    .where(eq(schema.region.type, 'district'))
  if (regions.length === 0) throw new Error('No districts available')
  return faker.helpers.arrayElement(regions).id
}

const initialize = async (rl: Interface) => {
  const status = await getDatabaseStatus()
  if (status.counts.users > 0) {
    const shouldReset = await confirm(
      rl,
      `${colors.warning}Existing data detected, reset before bootstrapping?${colors.reset}`,
    )
    if (!shouldReset) {
      console.log(`${colors.warning}Initialization aborted.${colors.reset}`)
      return
    }
    console.log(`${colors.warning}Purging auth schemas...${colors.reset}`)
    await resetDatabase()
  }

  console.log(
    `${colors.accent}Hydrating regions, activities types and statuses...${colors.reset}`,
  )
  await seed()
  const email = await requestEmail(rl)
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const password = createPassword()
  const documentNumber = faker.helpers.replaceSymbols('#########')
  const phone = `${faker.helpers.replaceSymbols('9########')}`
  const birthDate = faker.date.birthdate({ min: 23, max: 55, mode: 'age' })
  const regionId = await chooseRegionId()
  const organizationName = 'Cáritas Lima'
  const organizationSlug = slugify(organizationName)

  console.log(`${colors.accent}Creating root user...${colors.reset}`)
  const {
    user: { id: userId },
  } = await auth.api.createUser({
    body: {
      name: firstName,
      email,
      password,
      role: 'admin',
      data: {
        surname: lastName,
        documentType: 'DNI',
        documentNumber,
        sex: faker.helpers.arrayElement(['M', 'F']),
        birthDate: birthDate.toISOString().slice(0, 10),
        phone,
        regionId,
      },
    },
  })

  const { headers } = await auth.api.signInEmail({
    returnHeaders: true,
    body: {
      email,
      password,
    },
  })
  const cookie = headers?.get('set-cookie')
  if (!cookie) throw new Error('Failed to acquire session cookie')

  console.log(
    `${colors.accent}Wiring organization scaffolding...${colors.reset}`,
  )
  const organization = await auth.api.createOrganization({
    headers: { cookie },
    body: {
      name: organizationName,
      slug: organizationSlug,
      type: 'caritas',
    },
  })
  await auth.api.updateMemberRole({
    headers: { cookie },
    body: {
      memberId: organization?.members[0]?.id as string,
      organizationId: organization?.id,
      role: ['admin', 'owner'],
    },
  })
  if (!organization) throw new Error('Unable to create organization')
  await auth.api.setActiveOrganization({
    headers: { cookie },
    body: {
      organizationId: organization.id,
      organizationSlug: organization.slug ?? organizationSlug,
    },
  })
  const teamNames = [
    { name: 'Administrador', role: 'admin' },
    { name: 'Educación', role: 'educationMember' },
    { name: 'Salud', role: 'healthMember' },
  ]
  const teams = await Promise.all(
    teamNames.map(async (team) => {
      const teamCreated = await auth.api.createTeam({
        headers: { cookie },
        body: {
          name: team.name,
          organizationId: organization.id,
          role: team.role,
        },
      })
      if (!teamCreated) throw new Error(`Failed to create team ${team}`)
      return teamCreated
    }),
  )

  await auth.api.addTeamMember({
    headers: { cookie },
    body: {
      userId,
      teamId: teams[0].id,
    },
  })
  console.log(
    `\n${colors.accent}Bootstrap complete. Credentials unlocked:${colors.reset}`,
  )
  console.log(`  email    : ${email}`)
  console.log(`  password : ${colors.warning}${password}${colors.reset}`)
  console.log(
    `\n${colors.accent}Good luck, see you on the other side.⚡${colors.reset}`,
  )
}

export const seed = async () => {
  await Promise.all([seedDistricts(), seedActivities()])
}

const runCli = async () => {
  const rl = createInterface({ input, output })
  try {
    let continueLoop = true
    while (continueLoop) {
      const status = await getDatabaseStatus()
      printStatus(status)
      const choice = await ask(rl, '\nselect option > ')
      if (choice === '1') {
        try {
          await initialize(rl)
        } catch (error) {
          console.log(
            `\n${colors.danger}Initialization error: ${(error as Error).message}${colors.reset}`,
          )
        }
        await ask(rl, '\npress enter to continue...')
      } else if (choice === '2') {
        const sure = await confirm(
          rl,
          `${colors.danger}This will wipe auth data. Proceed?${colors.reset}`,
        )
        if (sure) {
          console.log(`${colors.warning}Executing reset...${colors.reset}`)
          await resetDatabase()
          console.log(`${colors.accent}Reset done.${colors.reset}`)
        } else {
          console.log(`${colors.warning}Reset cancelled.${colors.reset}`)
        }
        await ask(rl, '\npress enter to continue...')
      } else if (choice === '0') {
        continueLoop = false
      } else {
        console.log(`${colors.warning}Unknown option.${colors.reset}`)
        await ask(rl, '\npress enter to continue...')
      }
    }
  } finally {
    rl.close()
  }
}

if (import.meta.main) {
  runCli().catch((error) => {
    console.error(
      `${colors.danger}${error instanceof Error ? error.message : String(error)}${colors.reset}`,
    )
    process.exit(1)
  })
}
