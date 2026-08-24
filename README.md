# 🚀 Nova AI

> An intelligent, full-stack AI conversational assistant platform powered by Google Gemini, Express.js, React 19, Tailwind CSS v4, and Supabase.

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_DB-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

## 📖 Overview

**Nova AI** is an end-to-end AI chat platform engineered with modern web standards and real-time streaming capabilities. The platform combines a high-performance Express backend with Google Gemini AI integration and an administrative suite with a sleek, responsive React 19 frontend supporting rich markdown, LaTeX math formatting, interactive Mermaid diagrams, and role-based admin controls.

---

## ✨ Key Features

### 💬 Chat & AI Experience
- ⚡ **Real-time AI Streaming**: Token-by-token streaming from Google Gemini via ReadableStream.
- 📝 **Rich Markdown & Visual Elements**:
  - Syntax-highlighted code blocks with language indicators and one-click copy.
  - Interactive Mermaid diagram visualizations.
  - LaTeX / KaTeX mathematical equation rendering.
- 💾 **Persistent Chat History**: Automatically syncs conversations and messages with Supabase for authenticated users.
- 🎨 **Adaptive UI**: Dark and light themes with smooth transitions, responsive mobile sidebar drawer, and multi-panel layout.

### 🔐 Authentication & User Profiles
- 🔑 **Multi-method Authentication**: Email & password, OTP / magic link verification, and Google OAuth.
- 👤 **Custom Usernames**: Dynamic username generation on OAuth signups, real-time availability check, and profile editing.
- 🛡️ **Role-Based Access Control (RBAC)**: Secure separation between regular users and platform administrators.

### 📊 Admin Dashboard & Platform Insights
- 📈 **Overview Analytics**: Total users, conversations, messages, active users, and activity trends over time.
- 👥 **User Management**: Search, filter, view user conversation counts, promote/demote roles, and manage accounts.
- 💬 **Conversation Logs**: Review conversation histories, view message logs, and moderate discussions.
- 🤖 **AI Usage Metrics**: Daily token consumption analysis and model request distributions.

### 🌐 Cloud & Production Ready
- 🚀 **Vercel SPA Routing**: Seamless single-page application direct URL routing via `vercel.json`.
- 🗄️ **PostgreSQL Migrations**: Version-controlled Supabase database migrations with optimized RLS (Row Level Security) and indexes.

---

## 📁 Repository Structure

```text
Nova-AI/
├── Nova-AI-Backend/                    # Express.js REST & Streaming API
│   ├── migrations/                     # PostgreSQL / Supabase SQL migrations
│   │   ├── 001_add_fk_indexes.sql      # Foreign key performance indexes
│   │   ├── 002_optimize_rls_policies.sql # Subselect-optimized RLS policies
│   │   ├── 003_drop_auto_confirm_user_trigger.sql # Fix OTP verification bypass
│   │   ├── 004_create_users_table.sql  # public.users profile table & trigger
│   │   ├── 005_allow_public_select_users.sql # Public username availability checks
│   │   ├── 006_admin_relations_and_security.sql # Admin relations & security hardening
│   │   ├── 007_harden_google_oauth_handle_new_user.sql # Google OAuth username generation
│   │   └── README.md                   # Database migrations guide
│   ├── src/
│   │   ├── config/                     # Environment configuration loader
│   │   │   └── env.js
│   │   ├── controllers/                # Request handlers
│   │   │   ├── admin.controller.js     # Admin dashboard, users, conversations, usage
│   │   │   ├── chat.controller.js      # Streaming chat completions with Gemini
│   │   │   └── user.controller.js      # User profiles & username validation
│   │   ├── middleware/                 # Express middleware
│   │   │   ├── admin.middleware.js     # Admin role authorization guard
│   │   │   ├── auth.middleware.js      # Supabase JWT token verification
│   │   │   └── cors.js                 # Cross-origin resource sharing policy
│   │   ├── routes/                     # API Route declarations
│   │   │   ├── admin.routes.js         # /api/admin endpoints
│   │   │   ├── chat.routes.js          # /api/chat endpoints
│   │   │   ├── health.routes.js        # Health check endpoint (/)
│   │   │   ├── user.routes.js          # /api/users endpoints
│   │   │   └── index.js                # Master route router
│   │   ├── services/                   # External service integrations
│   │   │   ├── convo-admin.service.js  # Telemetry & session analytics webhook
│   │   │   ├── gemini.service.js       # Google Gemini Generative AI SDK service
│   │   │   └── supabase.service.js     # Supabase admin client (Service Role)
│   │   ├── app.js                      # Express app setup and middleware chain
│   │   └── server.js                   # Server bootstrap & port listener
│   ├── .env.example                    # Backend environment template
│   ├── index.js                        # Root entry point alias
│   ├── package.json                    # Backend dependencies & scripts
│   └── README.md                       # Backend documentation
│
└── Nova-AI-Frontend/                   # React 19 + Vite Single Page Application
    ├── public/                         # Static public assets
    ├── src/
    │   ├── assets/                     # Icons, logos, and UI graphics
    │   ├── components/                 # Component library
    │   │   ├── ai-elements/            # AI chat rendering components
    │   │   │   ├── conversation.jsx    # Conversation message container
    │   │   │   ├── message.jsx         # Message bubble with markdown/code/math
    │   │   │   ├── prompt-input.jsx    # Chat composer with multi-line auto-grow
    │   │   │   └── shimmer.jsx         # AI streaming loading placeholder
    │   │   ├── chat/                   # Main chat view components
    │   │   │   ├── chat-header.jsx     # Navigation bar, model selector, user menu
    │   │   │   ├── chat-layout.jsx     # Master chat desktop/mobile layout
    │   │   │   ├── chat-sidebar.jsx    # Session drawer, search, history lists
    │   │   │   ├── composer.jsx        # Bottom input composer wrapper
    │   │   │   ├── empty-state.jsx     # New chat welcome screen with prompt pills
    │   │   │   └── message-list.jsx    # Auto-scrolling message stream container
    │   │   └── ui/                     # Radix UI primitives & design tokens
    │   │       ├── button.jsx, card.jsx, dialog.jsx, dropdown-menu.jsx, ...
    │   ├── hooks/                      # Custom React hooks
    │   │   ├── use-chat.js             # Conversation management & streaming state
    │   │   └── use-theme.js            # Light/Dark mode state & system preference
    │   ├── lib/                        # Shared utilities & services
    │   │   ├── admin-api.js            # Admin client-side API SDK
    │   │   ├── auth-context.jsx        # Supabase auth provider & user session hook
    │   │   ├── supabase.js             # Supabase browser client initialization
    │   │   └── utils.js                # Class name mergers (clsx, tailwind-merge)
    │   ├── pages/                      # Application views
    │   │   ├── admin/                  # Admin dashboard views
    │   │   │   ├── admin-layout.jsx    # Admin shell navigation & sidebar
    │   │   │   ├── dashboard.jsx       # Overview statistics & recent activity
    │   │   │   ├── users-page.jsx      # User management table & role editor
    │   │   │   ├── conversations-page.jsx # Conversation explorer & moderation
    │   │   │   └── ai-usage-page.jsx   # Token usage metrics & model charts
    │   │   └── login.jsx               # Auth page (Sign in, Sign up, OTP, OAuth)
    │   ├── App.jsx                     # Root application component & routing
    │   ├── main.jsx                    # React 19 entry point
    │   └── styles.css                  # Global styles & Tailwind CSS v4 directives
    ├── .env.example                    # Frontend environment template
    ├── package.json                    # Frontend dependencies & scripts
    ├── vercel.json                     # Vercel SPA direct URL rewrite rules
    ├── vite.config.js                  # Vite configuration & path aliases
    └── README.md                       # Frontend documentation
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Primitives**: [Radix UI](https://www.radix-ui.com/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Icons & Animations**: [Lucide React](https://lucide.dev/), [Motion (Framer Motion)](https://motion.dev/)
- **Rich Rendering**: [Streamdown](https://github.com/) (GFM Markdown, Code Highlight, KaTeX Math, Mermaid)
- **Auth & Backend Client**: [@supabase/supabase-js](https://supabase.com/docs/reference/javascript)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express.js 4](https://expressjs.com/)
- **AI SDK**: [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) (Google Gemini)
- **Database & Auth**: [@supabase/supabase-js](https://supabase.com/) (Service Role Admin SDK)
- **Security & Utilities**: `cors`, `dotenv`, `nodemon`

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** (or **pnpm** / **yarn** / **bun**)
- **Google Gemini API Key**: [Get a Gemini API Key](https://aistudio.google.com/)
- **Supabase Project**: [Create a Supabase Project](https://supabase.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Nova-AI.git
cd Nova-AI
```

---

### 2. Database Setup (Supabase)

1. Open your Supabase Dashboard and go to the **SQL Editor**.
2. Run the migration scripts located in [`Nova-AI-Backend/migrations/`](file:///home/darshan/Darshan/Codebase/Nova-AI/Nova-AI-Backend/migrations/) in numerical order:
   - `001_add_fk_indexes.sql`
   - `002_optimize_rls_policies.sql`
   - `003_drop_auto_confirm_user_trigger.sql`
   - `004_create_users_table.sql`
   - `005_allow_public_select_users.sql`
   - `006_admin_relations_and_security.sql`
   - `007_harden_google_oauth_handle_new_user.sql`

---

### 3. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Nova-AI-Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Configure the backend variables in `.env`:
   ```env
   PORT=5001
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3.5-flash
   FRONTEND_URL=http://localhost:5173
   CONVO_ADMIN_URL=https://convo-admin.parkarlabs.in
   SYSTEM_PROMPT=

   # Supabase Service Role Config
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will run at `http://localhost:5001`.

---

### 4. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd Nova-AI-Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Configure the frontend variables in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_BACKEND_URL=http://localhost:5001
   ```

5. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend application will be live at `http://localhost:5173`.

---

## ⚙️ Environment Variables Reference

### Backend (`Nova-AI-Backend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `5001` | Port on which the Express server listens |
| `GEMINI_API_KEY` | **Yes** | — | Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-3.5-flash` | Gemini model identifier |
| `FRONTEND_URL` | No | `http://localhost:5173` | Allowed origin for CORS requests |
| `CONVO_ADMIN_URL` | No | `https://convo-admin.parkarlabs.in` | Logging/analytics webhook endpoint |
| `SYSTEM_PROMPT` | No | Nova assistant prompt | Custom system instructions for Gemini |
| `SUPABASE_URL` | **Yes** | — | Supabase project URL |
| `SUPABASE_ANON_KEY` | No | — | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | — | Supabase service role key (bypasses RLS for admin operations) |

### Frontend (`Nova-AI-Frontend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `VITE_SUPABASE_URL` | **Yes** | — | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | **Yes** | — | Supabase public anonymous key |
| `VITE_BACKEND_URL` | No | `http://localhost:5001` | URL of the backend API server |

---

## 📡 API Endpoints Reference

### 🏥 Health Check
- `GET /` — Service health and status check.

### 💬 Chat
- `POST /api/chat` — Stream chat completions with Google Gemini.
  ```json
  {
    "messages": [{ "role": "user", "content": "Explain quantum computing." }],
    "session_id": "optional-conversation-id",
    "user_identifier": "user@example.com"
  }
  ```

### 👤 Users
- `GET /api/users/check-username?username=:name` — Public check for username availability.
- `GET /api/users/me` — Authenticated user's profile.
- `PATCH /api/users/me` — Update authenticated user's profile details.
- `GET /api/users/:username` — Public user profile lookup.

### 🛡️ Admin (Requires Admin Role)
- `GET /api/admin/stats` — Overall platform statistics & activity metrics.
- `GET /api/admin/users` — Paginated user directory with activity counts.
- `PUT /api/admin/users/:id/role` — Update a user's role (`user` | `admin`).
- `DELETE /api/admin/users/:id` — Delete a user and cascade their records.
- `GET /api/admin/conversations` — Searchable and paginated conversation explorer.
- `GET /api/admin/conversations/:id/messages` — Fetch all messages in a specific conversation.
- `DELETE /api/admin/conversations/:id` — Delete a conversation and its messages.
- `GET /api/admin/ai-usage` — Token usage metrics, daily consumption, and top users.

---

## ☁️ Deployment

### Frontend (Vercel)
The frontend includes [`vercel.json`](file:///home/darshan/Darshan/Codebase/Nova-AI/Nova-AI-Frontend/vercel.json) to handle Single Page Application (SPA) client routing:
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
1. Import the repository into [Vercel](https://vercel.com).
2. Set the **Root Directory** to `Nova-AI-Frontend`.
3. Add the frontend environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_BACKEND_URL`).
4. Deploy!

### Backend (Render / Railway / VPS)
1. Deploy `Nova-AI-Backend`.
2. Configure all required environment variables including `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY`.
3. Set the `FRONTEND_URL` to your production frontend URL (e.g. `https://nova-ai-v1.vercel.app`).

---

## 📦 Available Scripts

### Backend (`Nova-AI-Backend`)
- `npm run dev` — Start the backend server with hot reloading via `nodemon`.
- `npm start` — Run the backend server in production mode with `node`.

### Frontend (`Nova-AI-Frontend`)
- `npm run dev` — Start the Vite development server with HMR.
- `npm run build` — Build the production bundle into `dist/`.
- `npm run preview` — Locally preview the production build.
- `npm run lint` — Lint codebase using ESLint.
- `npm run format` — Format files using Prettier.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
