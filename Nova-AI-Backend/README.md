# ⚙️ Nova AI — Backend

> High-performance Express.js REST and streaming API for Nova AI, integrating Google Gemini AI, Supabase Service Role admin management, user profile services, and telemetry logging.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Admin_SDK-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

---

## 📖 Overview

The **Nova AI Backend** serves as the core orchestration layer for the platform. It handles:
- Real-time token streaming from Google Gemini models directly to the frontend.
- Supabase JWT authentication validation and role-based access control (RBAC).
- User profile management, username availability validation, and Google OAuth hooks.
- Administrative endpoints for platform metrics, user directory controls, conversation moderation, and AI usage reporting.
- Asynchronous session telemetry logging to Convo-Admin.

---

## 📁 Directory Structure

```text
Nova-AI-Backend/
├── migrations/                         # PostgreSQL database migrations
│   ├── 001_add_fk_indexes.sql          # Performance FK covering indexes
│   ├── 002_optimize_rls_policies.sql   # Subselect-optimized RLS policies
│   ├── 003_drop_auto_confirm_user_trigger.sql # Remove OTP auto-confirm bypass
│   ├── 004_create_users_table.sql      # Profiles table & signup trigger
│   ├── 005_allow_public_select_users.sql # Public username check access
│   ├── 006_admin_relations_and_security.sql # Cascade FKs & security hardening
│   ├── 007_harden_google_oauth_handle_new_user.sql # OAuth username generator
│   └── README.md                       # Migrations documentation
├── src/
│   ├── config/                         # Environment & application config
│   │   └── env.js                      # Environment variable validation & exports
│   ├── controllers/                    # Route controllers
│   │   ├── admin.controller.js         # Metrics, users, conversations, AI usage
│   │   ├── chat.controller.js          # Google Gemini chat streaming handler
│   │   └── user.controller.js          # Profile management & username checks
│   ├── middleware/                     # Express middleware pipeline
│   │   ├── admin.middleware.js         # Admin role check (requires auth + role=admin)
│   │   ├── auth.middleware.js          # Supabase JWT Bearer token validator
│   │   └── cors.js                     # Dynamic CORS policy configuration
│   ├── routes/                         # Route endpoints
│   │   ├── admin.routes.js             # /api/admin route definitions
│   │   ├── chat.routes.js              # /api/chat route definitions
│   │   ├── health.routes.js            # / (health check) route definition
│   │   ├── user.routes.js              # /api/users route definitions
│   │   └── index.js                    # Route aggregator
│   ├── services/                       # Third-party service integrations
│   │   ├── convo-admin.service.js      # Convo-Admin session logging webhook
│   │   ├── gemini.service.js           # Google Generative AI streaming client
│   │   └── supabase.service.js         # Supabase client with Service Role bypass
│   ├── app.js                          # Express application initialization
│   └── server.js                       # Server entrypoint & port listener
├── .env.example                        # Backend environment configuration template
├── index.js                            # Root server entrypoint alias
└── package.json                        # Node.js dependencies & scripts
```

---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express.js 4](https://expressjs.com/)
- **AI SDK**: [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) (Gemini models)
- **Database & Auth**: [@supabase/supabase-js](https://supabase.com/docs/reference/javascript) (Service Role SDK)
- **Utilities**: `dotenv`, `cors`, `nodemon`

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** (or **pnpm** / **yarn** / **bun**)
- **Google Gemini API Key**: [Obtain from Google AI Studio](https://aistudio.google.com/)
- **Supabase Project**: [Create a Supabase Project](https://supabase.com/)

---

### Installation

1. Navigate to the backend directory:
   ```bash
   cd Nova-AI-Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` variables:
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

5. Start the development server:
   ```bash
   npm run dev
   ```
   The server will start listening at `http://localhost:5001`.

---

## ⚙️ Environment Variables Reference

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `5001` | Port on which the Express server listens |
| `GEMINI_API_KEY` | **Yes** | — | Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-3.5-flash` | Gemini model name identifier |
| `FRONTEND_URL` | No | `http://localhost:5173` | Allowed origin for CORS requests |
| `CONVO_ADMIN_URL` | No | `https://convo-admin.parkarlabs.in` | Logging/analytics webhook endpoint |
| `SYSTEM_PROMPT` | No | Nova assistant prompt | Custom system instructions for Gemini |
| `SUPABASE_URL` | **Yes** | — | Supabase project URL |
| `SUPABASE_ANON_KEY` | No | — | Supabase public anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | — | Supabase service role key (bypasses RLS for admin operations) |

---

## 📡 API Endpoints Reference

### 1. Health Check
- `GET /`
  - **Description**: Returns health status of the backend API.
  - **Response**:
    ```json
    {
      "status": "ok",
      "message": "Nova AI Backend is running 🚀"
    }
    ```

### 2. Chat Streaming
- `POST /api/chat`
  - **Description**: Streams responses from Google Gemini in chunks.
  - **Headers**: `Content-Type: application/json`
  - **Request Body**:
    ```json
    {
      "messages": [
        { "role": "user", "content": "How does photosynthesis work?" }
      ],
      "session_id": "conv-uuid-1234",
      "user_identifier": "user@example.com"
    }
    ```
  - **Response**: `text/plain` stream (Transfer-Encoding: chunked).

### 3. User Profiles (`/api/users`)
- `GET /api/users/check-username?username=desired_name`
  - **Description**: Checks whether a username is valid and available.
  - **Auth**: Public.
  - **Response**:
    ```json
    { "available": true, "username": "desired_name" }
    ```
- `GET /api/users/me`
  - **Description**: Returns profile details for the authenticated user.
  - **Auth**: Bearer JWT (`Authorization: Bearer <token>`).
- `PATCH /api/users/me`
  - **Description**: Updates the authenticated user's profile username.
  - **Auth**: Bearer JWT.
  - **Request Body**: `{ "username": "new_username" }`
- `GET /api/users/:username`
  - **Description**: Fetch public profile details by username.
  - **Auth**: Public.

### 4. Admin Management (`/api/admin`)
> All endpoints under `/api/admin` require a valid JWT Bearer token and an `admin` role in `public.users`.

- `GET /api/admin/stats`
  - **Description**: Summary metrics: total users, active users (7d/30d), total conversations, total messages, daily activity trends, and recent user signups.
- `GET /api/admin/users`
  - **Description**: Lists all registered users with conversation counts, message counts, and role information.
- `PUT /api/admin/users/:id/role`
  - **Description**: Elevate or demote user role (`user` / `admin`).
  - **Request Body**: `{ "role": "admin" }`
- `DELETE /api/admin/users/:id`
  - **Description**: Deletes a user account and cascades related database entries.
- `GET /api/admin/conversations?page=1&limit=20&search=keyword&userId=uuid`
  - **Description**: Paginated, filterable list of all user conversations.
- `GET /api/admin/conversations/:id/messages`
  - **Description**: Full message history for a specific conversation.
- `DELETE /api/admin/conversations/:id`
  - **Description**: Deletes a conversation and all its messages.
- `GET /api/admin/ai-usage?days=7`
  - **Description**: AI usage metrics, estimated token consumption, daily charts, and top active users.

---

## 🗄️ Database Migrations

Database migrations are stored in [`migrations/`](file:///home/darshan/Darshan/Codebase/Nova-AI/Nova-AI-Backend/migrations/).
Run each migration file sequentially in the Supabase SQL editor:
1. `001_add_fk_indexes.sql` — Add foreign key indexes.
2. `002_optimize_rls_policies.sql` — Optimize RLS performance with subselects.
3. `003_drop_auto_confirm_user_trigger.sql` — Remove automatic confirmation trigger.
4. `004_create_users_table.sql` — Create `public.users` table and signup trigger.
5. `005_allow_public_select_users.sql` — Allow anon query for username availability.
6. `006_admin_relations_and_security.sql` — Add foreign key relations for admin views.
7. `007_harden_google_oauth_handle_new_user.sql` — Add OAuth username generation logic.

---

## 📦 Available Scripts

- `npm run dev` — Start the development server with hot-reload via `nodemon`.
- `npm start` — Run the server in production mode using `node src/server.js`.
