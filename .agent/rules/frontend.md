---
trigger: always_on
---

MUST FOLLOW THESE RULES — NO EXCEPTIONS

Stack

Next.js (App Router)

React 18+

TypeScript (strict)

Tailwind CSS

pnpm

shadcn/ui

Architecture & Patterns

ALWAYS use App Router (src/app)

ALWAYS use Server Components by default

Use Client Components only when required ("use client")

ALWAYS use functional components

NEVER use class components

Prefer server actions and route handlers over client-side fetching when possible

TypeScript

ALWAYS use TypeScript

Keep types close to the code

Prefer interface over type for object shapes

Avoid any — use unknown if unavoidable

Explicitly type component props and function returns

Exports

ALWAYS prefer named exports

Avoid default exports except for Next.js pages/layouts

Styling

ALWAYS use Tailwind CSS utility classes

NEVER write custom CSS unless absolutely necessary

NEVER hardcode colors — use Tailwind’s color tokens

Keep styling declarative and readable

Components

UI primitives must be built on top of shadcn/ui

Reusable components live in src/components

Feature-specific components live close to their feature

Comments

ONLY add comments that explain why, not what

No obvious or redundant comments

Dev Environment

Dev server already runs on http://localhost:3000

NEVER start or restart the dev server

HMR is enabled

Project Structure

Keep this section up to date and use it as the source of truth.

public/                 # Static assets
src/
├── app/                # Next.js App Router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Landing page
│   ├── dashboard/
│   │   └── page.tsx    # Authenticated app
│   ├── api/            # Route handlers
│   │   └── health/
│   │       └── route.ts
├── components/
│   ├── ui/             # Base UI components (shadcn-based)
│   ├── layout/         # Header, sidebar, etc.
│   └── features/       # Feature-scoped components
├── lib/
│   ├── ai/             # LLM / OpenAI helpers
│   ├── api/            # API clients
│   └── utils/          # Pure utility functions
├── hooks/              # Custom React hooks
├── types/              # Shared TypeScript types
├── styles/             # Tailwind config extensions if needed
└── middleware.ts       # Optional middleware

Package Management

Package manager: pnpm

Lockfile: pnpm-lock.yaml (MUST be committed)

NEVER mix npm / yarn with pnpm

Common commands

pnpm dev — start dev server

pnpm build — production build

pnpm start — start production server

pnpm lint — lint code

Development Workflow

ALWAYS follow this workflow when implementing a feature or fixing a bug:

Clarify intent

What user problem does this solve?

Is this MVP or scalable version?

Plan before coding

List files to create or modify

Identify server vs client responsibilities

Implement

Follow project structure strictly

Keep components small and focused

Prefer server logic over client logic

Verify

Ensure TypeScript passes

Ensure no unused imports or dead code

Ensure UI matches Tailwind + shadcn conventions

Refactor if needed

Reduce duplication

Improve naming and structure

Git hygiene

Stage only relevant changes

Use clear, atomic commits

Testing Philosophy (MVP-first)

Prioritize logic correctness over exhaustive testing

Test:

AI prompts and transformations

Data formatting and parsing

Critical UI flows

Avoid over-testing early UI polish

Research & Documentation

NEVER hallucinate APIs, configs, or URLs

ALWAYS verify against official docs:

Next.js

Tailwind CSS

shadcn/ui

OpenAI / LLM providers

Prefer official examples over blog posts

Product Mindset (Important)

This is a B2B AI SaaS MVP.

Optimize for:

Speed of iteration

Clarity of value

Maintainability

Avoid:

Premature abstractions

Over-engineering

Fancy UI with unclear purpose

If a decision doesn’t help the user reach value faster — don’t do it.