# Cáritas Lima - Sistema de Gestión

Sistema web responsivo para la organización sin fines de lucro **Cáritas Lima** que permite gestionar campañas en dos áreas principales: **educación** y **salud**. Construido con Bun.js, React 19, Elysia.js y PostgreSQL, priorizando la **mejor experiencia de desarrollo** y **buenas prácticas** con máxima **type-safety** 💙.

## 🚀 Características Principales

### 🛠️ Herramientas de Desarrollo

- **[Husky](https://typicode.github.io/husky/)** - Git hooks automáticos para mantener la calidad del código
- **[Commitlint](https://commitlint.js.org/)** - Linter de convenciones de commits siguiendo [Conventional Commits](https://www.conventionalcommits.org/)
- **[Lint-staged](https://github.com/okonet/lint-staged)** - Ejecuta linters automáticamente en archivos staged
- **[Biome](https://biomejs.dev/)** - Linter y formateador ultrarrápido escrito en Rust 🦀
- **[Turborepo](https://turbo.build/repo)** - Administrador de workspaces para monorepos con caché inteligente

### 📦 Stack Tecnológico

- **Runtime**: [Bun](https://bun.sh) - Runtime JavaScript ultrarrápido con caché inteligente
- **Monorepo**: [Turborepo](https://turbo.build/repo) con workspaces para gestión eficiente
- **API**: [Elysia](https://elysiajs.com/) con documentación Swagger automática y Eden RPC type-safe
- **Frontend**: React 19 + TypeScript + Vite con TanStack (Query, Router, Table)
- **Base de datos**: PostgreSQL con [Drizzle ORM](https://orm.drizzle.team/) y Valkey (Redis OSS)
- **Autenticación**: [better-auth](https://www.better-auth.com/) con roles y organizaciones
- **Estilos**: Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/) con modo oscuro/claro
- **Testing**: Bun test runner nativo con configuración Jest-compatible

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

1. **[Bun](https://bun.sh)** - Instálalo desde [bun.sh](https://bun.sh)
2. **[Docker](https://docker.com)** - Para la base de datos local

Configura las variables de entorno:
```
GOOGLE_SMTP_USER=tu_usuario@gmail.com
GOOGLE_SMTP_APP_PASSWORD=tu_contraseña_de_aplicación
```
[Cómo generar una contraseña de aplicación](https://support.google.com/accounts/answer/185833?hl=es)

## 🎯 Estándares de Desarrollo

### Configuración de Código

- **Formato**: Biome con indentación de 2 espacios, comillas simples, semicolons opcionales
- **Linting**: Reglas recomendadas de Biome con organización automática de imports
- **TypeScript**: Estricto, sin tipos `any`, configuración compartida en `@workspace/typescript-config`
- **Git Hooks**: Husky + lint-staged para validación automática pre-commit
- **Commits**: Conventional Commits con Commitlint para historial estructurado

### Convenciones de Código

```typescript
// ✅ Usar single quotes y semicolons opcionales
const message = 'Hello world'

// ✅ No usar any, preferir tipos específicos
interface User {
  id: number
  email: string
}

// ✅ Nombres descriptivos sin comentarios innecesarios
const authenticatedUser = await getUser(token)
```

### Estructura de Carpetas por Dominio

```
modules/
├── auth/           # Autenticación y autorización
├── health/         # Campañas y actividades de salud
└── education/      # Programas educativos
    ├── index.ts    # Controlador principal
    ├── service.ts  # Lógica de negocio
    ├── model.ts    # Tipos y validaciones
    └── *.test.ts   # Tests unitarios
```

## 🏗️ Arquitectura Backend

### Controladores con Elysia

Los controladores manejan rutas y lógica de negocio:

```typescript
// apps/api/src/modules/health/activity/index.ts
import Elysia, { t } from 'elysia'
import betterAuth from '@/modules/auth'
import { HealthModel } from './model'
import { createActivity, getActivities } from './service'

export const activity = new Elysia({
  name: 'activity',
  prefix: '/activity',
})
  .use(betterAuth)  // Middleware de autenticación
  .get('', getActivities, {
    auth: true,  // Requiere autenticación
    response: {
      200: HealthModel.getActivities,
      401: t.Literal('Unauthorized'),
    },
  })
  .post('', ({ body }) => createActivity(body), {
    auth: true,
    body: HealthModel.createActivity,  // Validación automática
    response: {
      200: t.Number(),
      401: t.Literal('Unauthorized'),
    },
  })
```

### Servicios

Los servicios manejan interacción con la base de datos o servicios externos:

```typescript
// apps/api/src/modules/health/activity/service.ts
import db from '@/db'
import { activity } from '@/db/schemas/health'
import type { HealthModel } from './model'

export const createActivity = async (args: HealthModel.CreateActivity) => {
  const [{ id }] = await db.transaction(async (tx) => {
    return await tx.insert(activity).values(args).returning({
      id: activity.id,
    })
  })
  return id
}

export const getActivities = async (): Promise<HealthModel.GetActivities> => {
  return await db.query.activity.findMany({
    columns: {
      createdAt: false,  // Excluir campos sensibles
      updatedAt: false,
    },
  })
}
```

### Modelos y Validación

Los modelos usan Drizzle + TypeBox para type-safety end-to-end:

```typescript
// apps/api/src/modules/health/activity/model.ts
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'
import { activity } from '@/db/schemas/health'

export namespace HealthModel {
  const _getActivities = createSelectSchema(activity)
  export const getActivities = t.Array(
    t.Omit(_getActivities, ['createdAt', 'updatedAt']),
  )
  export type GetActivities = typeof getActivities.static

  const _createActivity = createInsertSchema(activity)
  export const createActivity = t.Omit(_createActivity, ['id'])
  export type CreateActivity = typeof createActivity.static
}
```

### Middleware de Autenticación

Middleware reutilizable con better-auth para proteger rutas:

```typescript
// apps/api/src/modules/auth/index.ts
import Elysia from 'elysia'
import { auth } from '@/lib/auth'

const betterAuth = new Elysia({ name: 'better-auth' }).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({ headers })
      if (!session) return status(401)
      
      return {
        user: session.user,
        session: session.session,
      }
    },
  },
})
```

### Testing con Bun

Tests unitarios usando el runner nativo de Bun:

```typescript
// apps/api/src/modules/health/activity/index.test.ts
import { describe, expect, it } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { auth } from '@/lib/auth'
import { activity } from '.'

describe('Health Activity Module', () => {
  it('Should not allow unauthenticated access', async () => {
    const api = treaty(activity)
    const response = await api.activity.get({ query: {}, headers: {} })
    expect(response.status).toBe(401)
  })

  it('Should list activities for authenticated user', async () => {
    // Crear usuario de prueba
    const { user } = await auth.api.createUser({
      body: {
        email: 'test@example.com',
        password: 'password',
        // ... otros campos
      },
    })
    
    // Obtener headers de autenticación
    const { headers } = await auth.api.signInEmail({
      returnHeaders: true,
      body: { email: 'test@example.com', password: 'password' },
    })
    
    // Probar endpoint protegido
    const api = treaty(activity)
    const response = await api.activity.get({
      query: {},
      headers: { cookie: headers.get('set-cookie') }
    })
    
    expect(response.status).toBe(200)
    expect(response.data).toBeInstanceOf(Array)
  })
})
```

## 🎨 Arquitectura Frontend

### Routing con TanStack Router

Sistema de routing type-safe con protección de rutas:

```typescript
// apps/frontend/src/routes/_authenticated.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context: { authClient }, location }) => {
    const { data } = await authClient.getSession()
    
    if (!data || data.user.role !== 'admin') {
      throw redirect({
        to: '/auth/login',
        search: { redirect: location.href },
      })
    }
  },
})
```

### Hooks Personalizados

Hooks reutilizables para lógica de autenticación:

```typescript
// apps/frontend/src/modules/auth/hooks/useLogin.ts
import { useMutation } from '@tanstack/react-query'
import authClient from '@/lib/authClient'

export const useLogin = (redirectPath: string) => {
  return useMutation({
    mutationFn: (params: {
      email: string
      password: string
      rememberMe: boolean
    }) =>
      authClient.signIn.email({
        email: params.email,
        password: params.password,
        rememberMe: params.rememberMe,
        callbackURL: redirectPath,
      }),
  })
}
```

### Formularios con React Hook Form + Zod

Formularios type-safe con validación automática:

```typescript
// apps/frontend/src/modules/auth/pages/login/index.tsx
const schema = z.object({
  email: z.string().min(2).max(100),
  password: z.string().min(6).max(100),
  rememberMe: z.boolean(),
})
type FormSchema = z.infer<typeof schema>

export default function FormLogin() {
  const { redirect } = useSearch({ from: '/auth/login' })
  const { mutate, isPending } = useLogin(redirect)
  
  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const handleSubmit = form.handleSubmit((data) => {
    mutate(data, {
      onSuccess: () => {
        // Manejar éxito
      },
    })
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* ... más campos */}
      </form>
    </Form>
  )
}
```

### Cliente RPC Type-Safe

Cliente Eden para comunicación type-safe con el backend:

```typescript
// apps/frontend/src/lib/rpc.ts
import { treaty } from '@elysiajs/eden'
import type { App } from 'api'
import { env } from '@/env.ts'

const client = treaty<App>(env.VITE_API_URL, {
  fetch: {
    credentials: 'same-origin',
  },
})

const rpc = client.api.v1  // Type-safe RPC client
export default rpc

// Uso en componentes:
// const { data } = await rpc.health.activity.get()
// const result = await rpc.health.activity.post({ title: 'Nueva actividad' })
```

### 🎯 Extensiones de VS Code Recomendadas

Para una experiencia de desarrollo óptima con **Visual Studio Code**, instala estas extensiones recomendadas:

- [Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) - Desarrollo remoto
- [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) - Linter y formateador integrado
- [Conventional Commits](https://marketplace.visualstudio.com/items?itemName=vivaxy.vscode-conventional-commits) - Asistente para commits estándar
- [Pretty TypeScript Errors](https://marketplace.visualstudio.com/items?itemName=yoavbls.pretty-ts-errors) - Errores TS más legibles
- [Version Lens](https://marketplace.visualstudio.com/items?itemName=pflannery.vscode-versionlens) - Visualiza versiones actuales de dependencias
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) - Autocompletado para Tailwind
- [GitLens — Git supercharged](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) - Herramientas Git avanzadas
- [Import Cost](https://marketplace.visualstudio.com/items?itemName=wix.vscode-import-cost) - Muestra el tamaño de los imports en tiempo real
- [Color Highlight](https://marketplace.visualstudio.com/items?itemName=naumovs.color-highlight) - Resalta códigos de color en CSS y archivos relacionados 
- [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) -  Asistente de IA para autocompletar código
- [SonarLint](https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarlint-vscode) - Análisis estático de código
- [Material Icon Theme](https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme) - Iconos personalizados para archivos y carpetas
- [Thunder Client](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client) - Cliente REST para probar APIs

## 🚀 Inicio Rápido

### Automatic setup

Ejecuta el script de configuración automática que instala dependencias, intenta levantar los contenedores de la DB y aplica el esquema en apps/api. Recomendado para un setup rápido en máquinas de desarrollo.

```bash
# Desde la raíz del proyecto
bun run setup
```

Si prefieres ver lo que hace el script directamente, también puedes ejecutarlo con:
```bash
bun run scripts/develop.ts
```

### Manual setup

Si necesitas controlar cada paso manualmente o el script automático no funciona en tu entorno, sigue estos pasos:

```bash
# 1. Instalar dependencias
bun install

# 2. Iniciar Docker y levantar servicios (desde apps/db)
cd apps/db
docker compose --env-file .env.development up -d

# 3. Esperar a que la DB esté lista y aplicar esquema (desde apps/api)
cd ../api
bun run db:push
bun run db:seed  # Sembrar datos iniciales
```

# 4. Iniciar desarrollo
cd ../..
bun dev
```

### 1. Clonar e Instalar

```bash
git clone https://github.com/fabzio/caritas-app.git
cd caritas-app
bun install
```

### 2. Configuración de Base de Datos

```bash
# Iniciar PostgreSQL y Valkey con Docker
cd apps/db
docker-compose up -d

# Migrar esquemas a la base de datos
cd ../api
bun run db:push
```

### 3. Variables de Entorno

Crea los archivos `.env.development` necesarios basándote en los ejemplos:

```bash
# apps/api/.env.development
DATABASE_URL="postgresql://user:password@localhost:5432/caritas_db"
VALKEY_URL="valkey://localhost:6379"
GOOGLE_CLIENT_ID="tu_google_client_id"
GOOGLE_CLIENT_SECRET="tu_google_client_secret"

# apps/frontend/.env.development  
VITE_API_URL="http://localhost:5173/api/v1"
VITE_GOOGLE_CLIENT_ID="tu_google_client_id"

# apps/db/.env.development
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=caritas_db
VALKEY_PASSWORD=your_valkey_password
```

### 4. Iniciar Desarrollo

```bash
# Desde la raíz del proyecto
bun dev
```

### 5. ¡Listo para Desarrollar!

- 🌐 **Frontend**: `http://localhost:5173`
- 🔌 **API**: `http://localhost:8000` 
- 📚 **Swagger Docs**: `http://localhost:8000/api/v1/openapi`
- 🗄️ **Base de datos**: PostgreSQL en puerto 5432

## 📁 Estructura del Proyecto

```
caritas-lima/
├── apps/
│   ├── api/          # API REST con Elysia + Drizzle ORM
│   │   ├── src/
│   │   │   ├── modules/      # Módulos de negocio (auth, health, education)
│   │   │   ├── db/          # Configuración BD y schemas
│   │   │   └── lib/         # Utilidades y configuración auth
│   │   └── drizzle.config.ts
│   ├── db/           # Docker Compose para PostgreSQL + Valkey
│   └── frontend/     # Aplicación React + TanStack
│       ├── src/
│       │   ├── modules/     # Características por dominio
│       │   ├── routes/      # Definición de rutas
│       │   ├── shared/      # Componentes y layouts compartidos
│       │   └── lib/         # Clientes RPC y auth
│       └── vite.config.ts
├── packages/
│   ├── typescript-config/  # Configuraciones TS compartidas
│   └── ui/          # Biblioteca de componentes shadcn/ui
└── scripts/
    └── develop.ts   # Script de configuración automática
```

### Módulos del Sistema

- **`apps/api/modules/auth`**: Autenticación con better-auth, roles y permisos
- **`apps/api/modules/health`**: Gestión de actividades y campañas de salud  
- **`apps/api/modules/education`**: Gestión de programas y campañas educativas
- **`apps/frontend/modules/auth`**: UI de login, registro y gestión de sesión
- **`apps/frontend/modules/admin`**: Dashboard y herramientas administrativas
- **`packages/ui`**: Componentes React reutilizables con theming

## 🔧 Comandos Disponibles

### Desarrollo

```bash
# Iniciar todas las aplicaciones en modo desarrollo
bun dev

# Iniciar aplicación específica
bun dev --filter=api
bun dev --filter=frontend
bun dev --filter=db
```

### Testing

```bash
# Ejecutar todos los tests
bun test

# Tests en modo watch
bun test --watch

# Tests de un módulo específico
bun test --filter=api
```

### Base de Datos

```bash
# Desde apps/api
cd apps/api

# Aplicar cambios al esquema
bun run db:push

# Generar migraciones
bun run db:generate

# Studio visual para BD
bun run db:studio
```

### Build y Deploy

```bash
# Construir todas las aplicaciones
bun run build

# Construir aplicación específica  
bun run build --filter=frontend
```

### Linting y Formateo

```bash
# Ejecutar Biome (linter + formateador)
bun run lint

```

## 🔄 Configuración de Git Hooks y CI/CD

### Git Hooks Automáticos

El proyecto usa **Husky** y **lint-staged** para validación automática:

- **Pre-commit**: Ejecuta Biome linter en archivos modificados
- **Commit-msg**: Valida formato de [Conventional Commits](https://www.conventionalcommits.org/)

```bash
# Ejemplos de commits válidos
git commit -m "feat: añadir módulo de actividades de salud"
git commit -m "fix: corregir validación en formulario de login"
git commit -m "docs: actualizar README con ejemplos de API"
```

## 📚 Enlaces Útiles

### Documentación del Stack

- **[Bun](https://bun.sh/docs)** - Runtime y package manager
- **[Elysia](https://elysiajs.com/introduction.html)** - Framework web para Bun
- **[Drizzle ORM](https://orm.drizzle.team/docs/overview)** - ORM type-safe
- **[better-auth](https://www.better-auth.com/docs/introduction)** - Autenticación moderna
- **[TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)** - State management
- **[TanStack Router](https://tanstack.com/router/latest/docs/framework/react/overview)** - Routing type-safe
- **[TanStack Table](https://tanstack.com/table/latest/docs/framework/react/overview)** - Tablas React
- **[shadcn/ui](https://ui.shadcn.com/docs)** - Componentes UI
- **[Tailwind CSS](https://tailwindcss.com/docs)** - CSS utility-first

### Herramientas de Desarrollo

- **[Biome](https://biomejs.dev/)** - Linter y formateador
- **[Turborepo](https://turborepo.com/docs)** - Monorepo build system
- **[Husky](https://typicode.github.io/husky/)** - Git hooks
- **[Commitlint](https://commitlint.js.org/)** - Conventional commits

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit siguiendo convenciones (`git commit -m 'feat: añadir nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

### Convenciones de Commits

```bash
feat: nueva funcionalidad
fix: corrección de bug  
docs: cambios en documentación
style: formato, missing semicolons, etc
refactor: cambio de código que no es fix ni feature
test: añadir tests
chore: cambios en build, etc
```
## Problemas Comunes
- **Error al levantar Docker**: Si la ejecutar `bun dev` en la raíz del proyecto da error al levantar la base de datos, prueba cambiando `docker compose` por `docker-compose` en el archivo `apps/db/package.json`
- **Error de variables de entorno**: Las variables de entorno para el cliente de google y cloudflare están definidas, las claves que usen servicios personales (como el correo) deben ser reemplazadas por las de tu cuenta revísa cómo [aquí](https://support.google.com/accounts/answer/185833?hl=es)
- Si usas un **cliente gráfico de Git** (como GitHub Desktop) y tienes problemas con los hooks de Husky, intenta hacer commits desde la terminal, por ahí mostrará errores más claros

## Consejos

- Usa **VS Code** con las extensiones recomendadas para una mejor experiencia de desarrollo
- Revisa **ejemplos ya implementados** para entender patrones y buenas prácticas o revisa la **documentación oficial** de las librerías usadas que incluye ejemplos antes de usar inteligencia artificial para generar código
- En relación a lo anterior, los patrones ya implmementados incluyen:
  - Rutas protegidas en frontend (TanStack Router) y en backend (Elysia + better-auth)
  - Manejo de estado con TanStack Query
  - Formularios con React Hook Form + Zod + shadcn/ui (Todos los componentes cuentan con guías de uso para forms en [shadcn/ui](https://ui.shadcn.com/docs))
  - CRUD type-safe end-to-end con Drizzle ORM + Elysia + Eden RPC
  - Todos los procesos que involucran autenticación usan los clientes de [better-auth](https://www.better-auth.com/docs/introduction)
  - Estructura de carpetas por dominio (modular)
- Mantén el código limpio para que tu PR sea aprobado. ts-ignore = ban \:)
- Corre los tests antes de hacer un PR para asegurarte que todo funciona correctamente