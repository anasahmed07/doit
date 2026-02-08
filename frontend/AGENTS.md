# AGENTS.md

This file provides guidance to AI agents (Claude, Gemini, etc.) when working with code in this directory.

## Environment
- **Framework**: Next.js 16 (React 19, App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 4
- **Auth**: Better Auth (client + server)
- **Drag & Drop**: Dnd-kit (core + sortable)
- **Testing**: Vitest + Testing Library
- **Package Manager**: npm

## Commands
```bash
npm install              # Install dependencies
npm run dev              # Start Next.js dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run test             # Run vitest
npm run test:watch       # Run vitest in watch mode
npm run auth:generate    # Generate Better Auth schema
npm run auth:migrate     # Run Better Auth migrations
```

## Structure
- `src/app/` - Next.js App Router pages and layouts
  - `(auth)/` - Auth route group (sign-in, sign-up)
  - `(dashboard)/` - Dashboard route group (dashboard, notes, projects)
  - `(website)/` - Public website route group (landing page)
  - `api/` - API routes (auth, categories, dashboard, notes, projects)
  - `layout.tsx` - Root layout
  - `globals.css` - Global styles
- `src/components/` - React components
  - `__tests__/` - Component tests
  - `KanbanBoard.tsx`, `DraggableNoteGrid.tsx` - Drag-and-drop views
  - `NoteCard.tsx`, `NoteForm.tsx`, `NoteViewDialog.tsx` - Note CRUD
  - `ProjectCreationDialog.tsx`, `ProjectsContext.tsx` - Project management
  - `Sidebar.tsx`, `Navbar.tsx`, `Footer.tsx` - Layout components
  - `ThemeProvider.tsx`, `ThemeToggle.tsx` - Dark mode support
- `src/lib/` - Shared utilities
  - `auth.ts` - Better Auth server config
  - `auth-client.ts` - Better Auth client config
  - `api-proxy.ts` - Backend API proxy helpers
  - `types.ts` - Shared TypeScript types
- `src/proxy.ts` - Next.js 16 proxy (replaces middleware.ts)

## Code Standards
- Use `@/*` path alias for imports (maps to `./src/*`).
- Use Server Components by default; add `"use client"` only when needed.
- Use `async` params/searchParams in page components (Next.js 16 requirement).
- Place API proxy logic in `src/lib/api-proxy.ts`, not directly in route handlers.
- Use `next-themes` for dark mode via `ThemeProvider`.
- Tests live in `src/components/__tests__/` colocated with components.
- Follow ESLint config (`eslint-config-next`).
