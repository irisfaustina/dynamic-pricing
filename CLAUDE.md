# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands
- `npm run dev` - Start development server with inspect
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database schema with Drizzle
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Start Drizzle Studio
- `npm run stripe:webhooks` - Start Stripe webhook listener

## Code Style Guidelines
- **TypeScript**: Use strict typing with Zod for form/data validation
- **Imports**: Use absolute imports with `@/` prefix (e.g., `import { x } from "@/lib/utils"`)
- **Component Structure**: React functional components with explicit return types
- **Error Handling**: Use structured returns with `{error: boolean, message: string}` pattern
- **Formatting**: Follow Next.js/TypeScript conventions with ESLint config
- **Server Actions**: Use "use server" directive for server-side code
- **CSS**: Use Tailwind with utility classes and clsx/twMerge for conditionals
- **File Organization**: Follow Next.js App Router conventions (`app/` for routes, components in `_components/`)
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Forms**: Use react-hook-form with Zod schema validation