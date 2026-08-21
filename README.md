# 🚀 Nova AI

> An intelligent, real-time AI conversational assistant powered by Google Gemini, Express.js, React 19, Tailwind CSS v4, and Supabase.

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_DB-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

---

## 📖 Overview

**Nova AI** is a full-stack AI chat web application engineered with modern web standards and real-time streaming capabilities. The application pairs a high-performance Express backend that streams responses directly from Google Gemini with a sleek, responsive React 19 frontend supporting markdown rendering, LaTeX math formatting, and Mermaid diagram visualization.

---

## ✨ Features

- ⚡ **Real-time AI Streaming**: Smooth token-by-token streaming from Google Gemini via Fetch ReadableStream.
- 🎨 **Modern & Responsive UI**: Built with React 19, Tailwind CSS v4, and Radix UI primitives with full dark/light mode support.
- 📝 **Rich Markdown & Visual Elements**:
  - Syntax-highlighted code blocks with copy-to-clipboard.
  - Interactive Mermaid diagrams.
  - Mathematical equations powered by LaTeX/KaTeX.
- 🔐 **Supabase Authentication**: Seamless user authentication with email/password and OTP / magic link options.
- 💾 **Persistent Chat History**: Automatically syncs conversations and messages to Supabase for logged-in users.
- 📊 **Telemetry & Logging**: Integrates turn logging and session analytics via Convo-Admin.
- 📱 **Mobile & Desktop Ready**: Adaptive sidebar drawer and multi-panel navigation.

---

## 📁 Repository Structure

```text
Nova-AI/
├── Nova-AI-Backend/            # Express.js REST & Streaming API
│   ├── src/
│   │   ├── config/             # Environment & configuration loader
│   │   ├── controllers/        # Route controllers (Chat, etc.)
│   │   ├── middleware/         # Custom Express middlewares
│   │   ├── routes/             # Express route declarations (/api/chat, /health)
│   │   ├── services/           # Gemini AI & Convo-Admin service integrations
│   │   ├── app.js              # Express app initialization
│   │   └── server.js           # Server entry point
│   ├── .env.example            # Backend environment template
│   └── package.json            # Backend dependencies and scripts
│
└── Nova-AI-Frontend/           # React 19 + Vite Single Page Application
    ├── src/
    │   ├── assets/             # Static image assets and logos
    │   ├── components/         # Reusable UI & chat components
    │   │   ├── ai-elements/    # AI message, prompt input, and streamdown renderers
    │   │   ├── chat/           # Layout, header, sidebar, composer, empty state
    │   │   └── ui/             # Radix UI primitives (buttons, dialogs, dropdowns, etc.)
    │   ├── hooks/              # Custom React hooks (use-chat, use-theme, use-mobile)
    │   ├── lib/                # Supabase client, auth context, and utilities
    │   ├── pages/              # Login and authentication view
    │   ├── App.jsx             # Root application component & routing
    │   ├── main.jsx            # React DOM mounting entry point
    │   └── styles.css          # Global CSS & Tailwind v4 styling
    ├── .env.example            # Frontend environment template
    ├── package.json            # Frontend dependencies and scripts
    └── vite.config.js          # Vite configuration
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Primitives**: [Radix UI](https://www.radix-ui.com/)
- **Icons & Animations**: [Lucide React](https://lucide.dev/), [Motion (Framer Motion)](https://motion.dev/)
- **Rendering**: [Streamdown](https://github.com/) (Markdown, Code, Math, Mermaid)
- **Auth & Database**: [@supabase/supabase-js](https://supabase.com/docs/reference/javascript)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express.js 4](https://expressjs.com/)
- **AI SDK**: [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) (Google Gemini)
- **Utilities**: `dotenv`, `cors`, `nodemon`

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** (or **bun** / **pnpm** / **yarn**)
- **Google Gemini API Key**: [Get a Gemini API Key](https://aistudio.google.com/)
- **Supabase Project**: [Create a Supabase project](https://supabase.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Nova-AI.git
cd Nova-AI
```

---

### 2. Backend Setup

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
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend will be running at `http://localhost:5001`.

---

### 3. Frontend Setup

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
   The frontend will be accessible at `http://localhost:5173`.

---

## ⚙️ Environment Variables Reference

### Backend (`Nova-AI-Backend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `5000` / `5001` | Port on which the Express server listens |
| `GEMINI_API_KEY` | **Yes** | — | Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-3.5-flash` | Gemini model identifier |
| `FRONTEND_URL` | No | `http://localhost:5173` | Allowed origin for CORS requests |
| `CONVO_ADMIN_URL` | No | `https://convo-admin.parkarlabs.in` | Logging/analytics webhook endpoint |
| `SYSTEM_PROMPT` | No | Nova assistant prompt | System prompt instructions for Gemini |

### Frontend (`Nova-AI-Frontend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `VITE_SUPABASE_URL` | **Yes** | — | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | **Yes** | — | Supabase public anonymous key |
| `VITE_BACKEND_URL` | No | `http://localhost:5001` | URL of the backend API server |

---

## 📡 API Endpoints

### 1. Health Check
- **Endpoint**: `GET /`
- **Response**:
  ```json
  {
    "status": "ok",
    "message": "Nova AI Backend is running 🚀"
  }
  ```

### 2. Stream Chat Completion
- **Endpoint**: `POST /api/chat`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "messages": [
      { "role": "user", "content": "Explain quantum computing in simple terms." }
    ],
    "session_id": "optional-conversation-id",
    "user_identifier": "user@example.com"
  }
  ```
- **Response**: `text/plain` chunked stream of the generated response.

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
