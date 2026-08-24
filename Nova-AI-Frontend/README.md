# 🎨 Nova AI — Frontend

> Modern, real-time React 19 frontend application for Nova AI, featuring streaming chat completions, rich markdown/code/math/Mermaid rendering, role-based admin dashboard, and Supabase authentication.

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-Components-161618?style=for-the-badge&logo=radix-ui&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-SPA_Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

## 📖 Overview

The **Nova AI Frontend** is a Single Page Application (SPA) designed to deliver a fluid AI conversational experience. It communicates directly with the Nova AI backend for real-time streaming AI responses and interacts with Supabase for user authentication, session persistence, and role-based data synchronization.

---

## ✨ Features

- ⚡ **Real-time AI Streaming**: Token-by-token streaming UI with animated typing effects and shimmer placeholders.
- 📝 **Rich Content Renderers**:
  - Code syntax highlighting with copy-to-clipboard.
  - Mathematical formula rendering via LaTeX / KaTeX.
  - Interactive Mermaid diagrams for flowcharts, sequences, and architectural charts.
- 🛡️ **Role-Based Admin Suite**:
  - **Overview Dashboard**: High-level platform statistics, active user counters, and activity metrics.
  - **User Management**: User directory with conversation statistics and role elevation (`user` / `admin`).
  - **Conversations Explorer**: Searchable conversation viewer with full message transcripts and moderation tools.
  - **AI Token Usage**: Token consumption monitoring, model breakdowns, and usage analytics with Recharts.
- 🔐 **Comprehensive Authentication**:
  - Email/password sign-in and registration with username availability checking.
  - One-Time Password (OTP) / Magic link verification.
  - Google OAuth single sign-on with automatic username assignment.
- 🌗 **Theme Switcher**: Dark mode, light mode, and system preference detection with smooth CSS transitions.
- 📱 **Responsive Design**: Drawer navigation for mobile screens and collapsible sidebars for desktop power users.
- 🚀 **Vercel SPA Ready**: Native `vercel.json` rewrites for direct URL navigation without 404 errors.

---

## 📁 Directory Structure

```text
Nova-AI-Frontend/
├── public/                     # Static public assets & favicons
├── src/
│   ├── assets/                 # SVGs, brand graphics, and icons
│   ├── components/             # Reusable UI component library
│   │   ├── ai-elements/        # AI streamdown and chat rendering
│   │   │   ├── conversation.jsx # Conversation list container
│   │   │   ├── message.jsx      # Message bubble with markdown/code/math
│   │   │   ├── prompt-input.jsx # Auto-growing multiline prompt composer
│   │   │   └── shimmer.jsx      # Animated shimmer skeleton loader
│   │   ├── chat/               # Main chat view components
│   │   │   ├── chat-header.jsx  # Top bar with title, model select, user menu
│   │   │   ├── chat-layout.jsx  # Main chat view orchestrator
│   │   │   ├── chat-sidebar.jsx # Conversation history, search, and drawer
│   │   │   ├── composer.jsx     # Prompt input container
│   │   │   ├── empty-state.jsx  # New conversation welcome screen & suggestion pills
│   │   │   └── message-list.jsx # Auto-scroll message stream container
│   │   └── ui/                 # Accessible Radix UI primitives
│   │       ├── button.jsx, card.jsx, dialog.jsx, dropdown-menu.jsx, ...
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-chat.js         # Chat state machine, streaming listener, Supabase sync
│   │   └── use-theme.js        # Dark/light theme state & toggle
│   ├── lib/                    # SDKs, contexts, and helper utilities
│   │   ├── admin-api.js        # Admin endpoints client SDK
│   │   ├── auth-context.jsx    # AuthProvider context & useAuth hook
│   │   ├── supabase.js         # Supabase client singleton
│   │   └── utils.js            # Tailwind merge utility (cn)
│   ├── pages/                  # Page routes
│   │   ├── admin/              # Admin dashboard pages
│   │   │   ├── admin-layout.jsx # Admin layout shell & navigation sidebar
│   │   │   ├── dashboard.jsx    # Metrics cards, activity charts, quick feeds
│   │   │   ├── users-page.jsx   # Paginated user management table & role dialog
│   │   │   ├── conversations-page.jsx # Searchable conversation history explorer
│   │   │   └── ai-usage-page.jsx # Token consumption & model usage charts
│   │   └── login.jsx           # Unified login, signup, OTP, and OAuth view
│   ├── App.jsx                 # Client-side router & provider shell
│   ├── main.jsx                # React DOM root render
│   └── styles.css              # Tailwind CSS v4 entrypoint & theme variables
├── .env.example                # Environment variable sample
├── package.json                # Frontend package dependencies & scripts
├── vercel.json                 # Vercel SPA routing configuration
└── vite.config.js              # Vite configuration & path alias mapping
```

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Component Primitives**: [Radix UI](https://www.radix-ui.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Markdown & Math**: [Streamdown](https://github.com/), [React Markdown](https://github.com/remarkjs/react-markdown), [Remark GFM](https://github.com/remarkjs/remark-gfm)
- **Icons & Animation**: [Lucide React](https://lucide.dev/), [Motion](https://motion.dev/)
- **Auth & Data**: [@supabase/supabase-js](https://supabase.com/docs/reference/javascript)
- **Toasts**: [Sonner](https://sonner.emilkowal.ski/)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** (or **pnpm** / **yarn** / **bun**)

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd Nova-AI-Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```

4. Populate your `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_BACKEND_URL=http://localhost:5001
   ```

5. Launch the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## ⚙️ Environment Variables

| Variable | Required | Description |
| :--- | :---: | :--- |
| `VITE_SUPABASE_URL` | **Yes** | The URL of your Supabase project instance |
| `VITE_SUPABASE_ANON_KEY` | **Yes** | The public anonymous key for Supabase client queries |
| `VITE_BACKEND_URL` | No | URL of the backend API (defaults to `http://localhost:5001`) |

---

## ☁️ Vercel Deployment & SPA Routing

When deploying a Single Page Application (SPA) to Vercel, requests to direct paths like `/login` or `/admin` must be rewritten to `/index.html` to avoid 404 errors.

This project includes [`vercel.json`](file:///home/darshan/Darshan/Codebase/Nova-AI/Nova-AI-Frontend/vercel.json):
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Steps to Deploy to Vercel:
1. Connect your repository to [Vercel](https://vercel.com).
2. Set **Root Directory** to `Nova-AI-Frontend`.
3. Set **Framework Preset** to `Vite`.
4. Configure the Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_BACKEND_URL`).
5. Click **Deploy**.

---

## 📦 Available Scripts

- `npm run dev` — Start the local development server with Hot Module Replacement (HMR).
- `npm run build` — Build the optimized production bundle in `dist/`.
- `npm run preview` — Locally preview the generated production build.
- `npm run lint` — Run ESLint to check for code quality and syntax issues.
- `npm run format` — Automatically format code using Prettier.
