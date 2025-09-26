# Project Overview

This repository is a responsive web application that allows a non profit organization "Cáritas Lima" to manage their campaigns in two main areas: education and health. 
It is built using Bun.js as the runtime environment, React 19 for the frontend, Elysia.js for the backend, and PostgreSQL as the database.

## Folder Structure

- `/.github`: Contains GitHub-specific files, including issue templates and workflows.
- `/apps`: Contains the repository's applications.
- `/apps/api`: The backend application built with Elysia.js.
- `/apps/frontend`: The frontend application built with React 19.
- `/apps/db`: Contains docker-compose.yml for PostgreSQL and Valkey (oss fork of Redis)
- `/packages`: Contains shared packages like tsconfig files and shadcn ui components.

## Libraries and Frameworks

- React 19: A JavaScript library for building user interfaces.
- Tanstack Query: A powerful data-fetching and state management library for React.
- Tanstack Table: A headless UI library for building tables in React.
- Tanstack Router: A type-safe routing library for React applications.
- Elysia.js: A web framework for building fast and efficient APIs.
- Drizzle ORM: A TypeScript ORM for SQL databases.
- better-auth: An authentication library for handling user authentication and authorization.

## Coding Standards

- Don't use `any` type in TypeScript.
- Don't user semicolons.
- Use single quotes for strings.
- Use SonarQube linting rules for code quality and consistency.
- Avoid writing comments, never write comments. Write self-explanatory code instead.
- Focus on writing clean, maintainable, self-explanatory, secure, and efficient code.
- Review the current codebase to understand existing patterns and practices before adding new code.
- Testing in api should use bun:test (jest compatible) and in frontend use vitest and react testing library.

## UI guidelines

- Dont ever add bg colors since dark and light mode colors are handled by shadcn ui themes.
- Use the default shadcn ui variables like -muted -accent, etc (defined in /packages/ui/src/styles/globals.css)