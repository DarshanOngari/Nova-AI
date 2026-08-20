# Plan: ChatGPT-style AI chat interface (frontend only)

## Goal
Replace the placeholder homepage with a polished, ChatGPT-like chat UI that works in light (white) and dark (black) themes. No backend or real AI API calls yet — replies will be temporary placeholder text with a streaming/typewriter effect.

## What will be built

```text
/
├── Sidebar (collapsible on mobile)
│   ├── "New chat" button
│   └── Scrollable list of past conversation titles
├── Main chat area
│   ├── Empty state with agent identity + sample prompts
│   ├── Scrollable message list (user + assistant)
│   ├── Composer at the bottom (multiline input + send)
│   └── Theme toggle in the header
```

## Key features

1. **Frontend-only chat state**
   - Conversation list, active thread, and messages stored in React state.
   - "New chat" creates a fresh thread and switches to it.
   - Selecting a sidebar conversation loads its messages.

2. **Temporary AI replies**
   - When the user sends a message, a placeholder assistant response streams in word-by-word.
   - No fetch/API call; purely local mock behavior for UI demonstration.

3. **Streaming text**
   - Assistant message appears with a typewriter/streaming effect.
   - A subtle "thinking" shimmer while the response is being prepared.

4. **White & black theme**
   - Uses the existing Tailwind v4 semantic tokens (`background`, `foreground`, `primary`, etc.).
   - Adds a theme toggle that switches between light and dark modes.

5. **Message rendering**
   - Assistant messages rendered directly on the chat surface (no default bubble background).
   - User messages use a filled high-contrast bubble (`primary` background, `primary-foreground` text).
   - Markdown support for assistant replies.

## Implementation approach

- Install AI Elements primitives (`conversation`, `message`, `prompt-input`, `shimmer`) via the shadcn registry, per the project chat-UI guidelines.
- Build the screen from those primitives rather than hand-rolling bubbles, composer, or loading states.
- Generate a small domain-specific agent logo/avatar instead of using a generic sparkle icon.
- Keep all logic in the route component and a local `useChat` hook; no server functions or database.

## Files to create / change

- `src/routes/index.tsx` — replace placeholder with the chat page and route head metadata.
- `src/components/chat/chat-layout.tsx` — sidebar + main area layout.
- `src/components/chat/chat-sidebar.tsx` — conversation list and new-chat button.
- `src/components/chat/chat-header.tsx` — title bar + theme toggle.
- `src/components/chat/empty-state.tsx` — branded welcome + sample prompts.
- `src/components/chat/message-list.tsx` — render messages using AI Elements.
- `src/components/chat/composer.tsx` — multiline prompt input using AI Elements `PromptInput`.
- `src/hooks/use-chat.tsx` — local state for threads, messages, and streaming mock replies.
- `src/styles.css` — ensure dark mode toggle works; add any chat-specific tokens if needed.
- `src/assets/agent-logo.png` — generated domain-specific logo.

## Out of scope

- Real AI API integration.
- Conversation persistence (localStorage or database).
- User authentication.
- Backend/server functions.

## Verification

- Run the dev build/typecheck.
- Confirm the placeholder is gone and `/` renders the chat interface.
- Test light/dark toggle, new chat, sidebar selection, and streaming reply.
