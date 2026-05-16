```                                                          
                                  ██                        
  ░████░                          ██                        
  ██████                          ██                 ██     
 ▒██  ██▒                                            ██     
 ██▒  ▒██  ██    ██  ██    ██   ████     ██░████   ███████  
 ██    ██  ██    ██  ██    ██   ████     ███████▓  ███████  
 ██    ██  ██    ██  ██    ██     ██     ███  ▒██    ██     
 ██    ██  ██    ██  ██    ██     ██     ██    ██    ██     
 ██    ██  ██    ██  ██    ██     ██     ██    ██    ██     
 ██▒  ▒██  ██    ██  ██    ██     ██     ██    ██    ██     
 ▒██  ██▓  ██▒  ███  ██▒  ███     ██     ██    ██    ██░    
  ██████░  ▓███████  ▓███████  ████████  ██    ██    █████  
  ░█████    ▓███░██   ▓███░██  ████████  ██    ██    ░████  
     ░██▒                                                   
      ░█                                                    
 ```                                                           
                                                            
> **Turn Telegram chaos into clear, structured knowledge.**

Quint is a B2B AI SaaS designed to help you extract the core value from noisy Telegram channels. It provides structured summaries, semantic search, and topic grouping to keep your knowledge base clean and actionable.

## ✨ Key Features

- **Channel Analysis:** AI-powered analysis of any public Telegram channel using LLaMA 3.3 70B.
- **Folder Digests:** Group related channels into folders and generate aggregated weekly digests, finding the signal in the noise.
- **Semantic Search:** Find answers across your saved channel analyses instead of just matching keywords.
- **Insights & Topic Grouping:** Automatically extract key insights, actionable steps, and trending topics.
- **Realtime UI:** Beautiful, responsive UI built with Next.js App Router, Tailwind CSS, and shadcn/ui.

## 🛠 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Language:** TypeScript
- **Database & Auth:** [Supabase](https://supabase.com/)
- **AI Models:** LLaMA 3.3 70B via [Groq](https://groq.com/) & [Jina AI](https://jina.ai/) for embeddings (via Python backend)
- **Package Manager:** `pnpm`

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v20+) and **pnpm** installed on your machine.

### 1. Clone the repository

```bash
git clone https://github.com/vlat247/quuint.git
cd quuint
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Setup Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# LLM APIs
GROQ_API_KEY=your_groq_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Telegram configuration (used for analysis)
TG_SESSION=your_telegram_session

# Optional: Custom Backend URL (defaults to production Render backend)
NEXT_PUBLIC_BACKEND_URL=https://quint-backend-xq3u.onrender.com
```

### 4. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📁 Project Structure

This Next.js application strictly uses the **App Router** paradigm:

- `/app` — Next.js routing, pages, and layouts (`page.tsx`, `layout.tsx`, `actions.ts`). Server Actions are preferred over API routes.
- `/components` — Reusable React components (UI primitives built on shadcn/ui and feature components).
- `/lib` — Utility functions, API clients, and Supabase client configuration.
- `/public` — Static assets.

## 🧑‍💻 Development Workflow

1. **Server First:** Prefer server components by default. Use `"use client"` only when interactive client-side logic is required.
2. **Styling:** Always use Tailwind utility classes. No custom CSS unless absolutely necessary. Keep styling declarative.
3. **Data Fetching:** Use Next.js Server Actions (`app/actions.ts`) for mutations and server components for data fetching.

## 🤝 Contributing

Contributions to Quint are welcome! Please ensure you follow the existing code style (strict TypeScript, functional components, Tailwind CSS) and open a Pull Request indicating the purpose of your changes.

## 📜 License

[MIT License](LICENSE)
