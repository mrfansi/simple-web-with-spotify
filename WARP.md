# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (uses Turbopack for fast HMR)
- **Production build**: `npm run build`
- **Production server**: `npm run start`
- **Linting**: `npm run lint`

## Architecture Overview

This is a **Next.js 15** project using the **App Router** with **React Server Components (RSC)** and **TypeScript**. The tech stack includes:

- **Next.js 15** with App Router for file-based routing and server-side rendering
- **Turbopack** for fast development builds and Hot Module Replacement
- **TypeScript 5** with strict configuration
- **Tailwind CSS v4** using the new CSS architecture with native CSS layers
- **shadcn/ui** component library built on **Radix UI primitives**
- **React Hook Form** with **Zod** validation for form handling
- Additional UI libraries: Lucide React (icons), Recharts (charts), Sonner (toasts)

The App Router enables both Server-Side Rendering (SSR) and Static Site Generation (SSG) with React Server Components for optimal performance.

## Project Structure

```
src/
├── app/                    # App Router pages and layouts
│   ├── layout.tsx         # Root layout with font configuration
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles with Tailwind and theme variables
├── components/
│   └── ui/                # shadcn/ui generated components (40+ components)
├── hooks/                 # Custom React hooks
│   └── use-mobile.ts     # Mobile breakpoint detection hook
└── lib/
    └── utils.ts          # Utility functions (cn function for class merging)
```

### Path Aliases

The project uses TypeScript path aliases defined in both `tsconfig.json` and `components.json`:
- `@/*` → `./src/*`
- `@/components` → `./src/components`  
- `@/lib` → `./src/lib`
- `@/hooks` → `./src/hooks`
- `@/ui` → `./src/components/ui`

## Configuration Notes

### Tailwind CSS v4
- Uses the new Tailwind CSS v4 with `@tailwindcss/postcss`
- Theme system based on CSS custom properties in `src/app/globals.css`
- Dark mode implemented with `.dark` class selector
- Color scheme uses OKLCH color space for better color consistency

### shadcn/ui Setup
- Configuration in `components.json` with "new-york" style variant
- Components use Radix UI primitives with custom styling
- Supports both light and dark themes via CSS variables
- Uses Lucide React for consistent iconography

### TypeScript Configuration
- Strict mode enabled with comprehensive type checking
- ES2017 target with modern module resolution
- JSX preservation for Next.js compilation
- Incremental compilation for faster builds

### ESLint
- Uses flat config format (`eslint.config.mjs`)
- Extends Next.js recommended rules for Core Web Vitals and TypeScript

### Development Features
- **Turbopack**: Enabled by default in development for 10x faster builds
- **Fast Refresh**: Hot module replacement for instant UI updates
- **Font Optimization**: Automatic optimization of Geist fonts via `next/font`
