# Hoppscotch Agent Guidelines

This document provides guidelines for AI agents working on the Hoppscotch codebase.

## Build/Lint/Test Commands

This is a pnpm monorepo. Always use `pnpm` instead of npm/yarn.

### Root-level Commands (Run from `/home/vassaneer/Desktop/project/hoppscotch`)

```bash
# Development - runs all packages in dev mode
pnpm dev

# Build for production
pnpm generate

# Lint all packages
pnpm lint

# Fix linting issues
pnpm lintfix

# Type check all packages
pnpm typecheck

# Run all tests
pnpm test

# Pre-commit hook (runs lint + typecheck)
pnpm pre-commit
```

### Package-Specific Commands

Each package in `/packages/` has its own test commands:

**Backend (NestJS + Jest):**
```bash
cd packages/hoppscotch-backend

# Run all tests
pnpm test

# Run single test file
pnpm jest user.service.spec.ts

# Run tests matching pattern
pnpm jest --testNamePattern="should create user"

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov

# E2E tests
pnpm test:e2e
```

**Common/Vue packages (Vitest):**
```bash
cd packages/hoppscotch-common

# Run all tests once
pnpm test

# Run single test file
pnpm vitest run src/helpers/auth/types/__tests__/basic.spec.ts

# Watch mode
pnpm test:watch
```

**CLI:**
```bash
cd packages/hoppscotch-cli

# Run tests
pnpm test

# Build
pnpm build

# Dev mode with watch
pnpm dev
```

**Always run tests for a specific package before committing changes to that package.**

## Packages Overview

The monorepo contains the following packages in `/packages/`:

### Core Packages

**@hoppscotch/data** - Data types, validations and migrations for Hoppscotch public data structures
- Type definitions and validations for REST/GQL requests, collections, environments
- Uses fp-ts, io-ts, zod for functional programming and runtime validation
- No tests, focused on type definitions

**@hoppscotch/kernel** - Cross-platform runtime kernel for Hoppscotch platform-ops
- Core platform abstractions and APIs
- Handles file system, native dialogs, shell execution
- Supports Tauri integration for desktop features

**@hoppscotch/common** - Shared Vue components, composables, helpers, and core UI logic
- Vue 3 components and composables (useAuth, onLoggedIn, etc.)
- RxJS-based reactive streams for state management
- GraphQL client setup with URQL
- Platform abstraction layer
- Tests run with Vitest

**@hoppscotch/js-sandbox** - JavaScript sandboxes for running external scripts
- Web and Node.js sandbox implementations
- Isolated execution environment using isolated-vm
- Used by CLI for running pre/post request scripts
- Tests run with Vitest

**@hoppscotch/codemirror-lang-graphql** - GraphQL language support for CodeMirror
- Custom CodeMirror language definition for GraphQL syntax highlighting
- Uses Lezer parser generator
- Built with Rollup

### Application Packages

**hoppscotch-backend** - NestJS backend API server
- GraphQL API with Apollo Server
- Database layer using Prisma ORM
- Authentication (JWT, OAuth2, Local)
- Email notifications via nodemailer
- Real-time subscriptions via Redis PubSub
- Tests run with Jest

**hoppscotch-sh-admin** - Self-hosted admin dashboard (Vue 3 + Vite)
- Admin interface for managing users, teams, settings
- GraphQL integration with backend
- Uses URQL Vue client

**hoppscotch-selfhost-web** - Self-hosted web frontend (Vue 3 + Vite)
- Main web application for self-hosted deployments
- PWA support with Workbox
- GraphQL code generation
- Depends on @hoppscotch/common, @hoppscotch/kernel

**hoppscotch-agent** - Tauri-based desktop agent application
- Lightweight agent for desktop API testing
- Built with Vue 3 and Tauri v2
- Shell integration for command execution

**hoppscotch-desktop** - Full-featured desktop application (Tauri)
- Desktop version of Hoppscotch using Tauri v2
- Native file system access
- Auto-updater support
- Portable mode support
- Includes Rust webapp bundler

**@hoppscotch/cli** - Command-line interface for CI/CD
- Run Hoppscotch collections and tests in CI environments
- Supports environment variables, test scripts
- Built with tsup for bundling
- Uses isolated-vm for sandboxing
- Tests run with Vitest

**hoppscotch-relay** - (placeholder package - appears empty)

## Code Style Guidelines

### Formatting (Prettier)
- **No semicolons** at end of lines
- **Double quotes** for strings (backend uses single, frontend uses double)
- **2-space indentation** (no tabs)
- **Trailing commas** in ES5 style (where valid)
- **Print width**: 80 characters
- **EditorConfig**: LF line endings, UTF-8, trim trailing whitespace

### TypeScript Conventions

**Imports:**
- Use workspace imports: `@hoppscotch/data`, `@hoppscotch/kernel`, `@hoppscotch/common`
- Use path aliases for local imports: `~/` maps to `src/`
- Group imports: external libs first, then workspace packages, then local aliases

**Naming:**
- **PascalCase**: Types, interfaces, classes, Vue components
- **camelCase**: Variables, functions, methods, composables (e.g., `onLoggedIn`, `useAuth`)
- **UPPER_SNAKE_CASE**: Constants, especially error codes
- Prefix unused vars/args with `_` (e.g., `_unused`) to satisfy ESLint

**Types:**
- Avoid `any` when possible, though the rule is disabled for pragmatic use
- Use `no-non-null-assertion` carefully (rule disabled but use sparingly)
- Use fp-ts types for functional programming: `TaskOption`, `Either`, etc.
- Runtime validation with io-ts and zod for data structures

**Functions:**
- Prefer explicit return types on exported functions
- Use arrow functions for callbacks and composables
- Composables should start with `use` prefix (Vue convention)

### Error Handling
- Use fp-ts for error handling: `TaskOption`, `Either`, `TaskEither`
- Backend uses constants for error codes (e.g., `USER_NOT_FOUND`)
- Don't use `console.log` in production (warns in dev, errors in prod lint)

### Code Patterns

**Vue/Frontend:**
```typescript
// Composables pattern
export function useFeature() {
  const value = ref()
  // logic
  return { value }
}

// RxJS streams with Vue
export const stream = platform.auth.getCurrentUserStream()
const currentUser = useReadonlyStream(stream, initialValue)
```

**Backend (NestJS):**
```typescript
// Service injection pattern
@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private pubsub: PubSubService
  ) {}
}
```

### Restricted Patterns
- **Never use `localStorage` directly** - always use `PersistenceService`
- ESLint will error on direct localStorage access

### Commit Messages
- Uses Conventional Commits (commitlint)
- Format: `type(scope): message`
- Types: feat, fix, docs, style, refactor, test, chore

### File Organization
- Monorepo structure: packages in `/packages/`
- Common shared code: `@hoppscotch/common`
- Data types: `@hoppscotch/data`
- Backend: `hoppscotch-backend`
- Each package has its own tsconfig and eslint config

## Key Technologies
- **Vue 3** with Composition API
- **TypeScript** (strict mode off in backend)
- **fp-ts** + **io-ts** for functional programming
- **RxJS** for reactive streams
- **GraphQL** with URQL
- **NestJS** for backend
- **Prisma** for database
- **Zod** for validation
- **Jest** (backend tests) / **Vitest** (frontend tests)
- **Tauri v2** for desktop apps
- **Vite** for build tooling
