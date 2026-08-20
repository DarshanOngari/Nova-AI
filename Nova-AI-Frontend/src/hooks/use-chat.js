import { useCallback, useEffect, useState, useRef } from "react";
import { nanoid } from "nanoid";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

function makeTitle(text) {
  const trimmed = text.trim();
  if (trimmed.length <= 28) return trimmed;
  return `${trimmed.slice(0, 28).trim()}…`;
}

function createLocalConversation() {
  const now = new Date();
  return {
    id: `local-${nanoid()}`,
    title: "New chat",
    messages: [],
    createdAt: now,
    updatedAt: now,
    isPersisted: false,
  };
}

export function useChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [status, setStatus] = useState("idle");

  const loadedUserRef = useRef(null);

  // Load conversations from Supabase when user changes
  useEffect(() => {
    if (!user) {
      if (conversations.length === 0) {
        const local = createLocalConversation();
        setConversations([local]);
        setActiveId(local.id);
      }
      loadedUserRef.current = null;
      return;
    }

    if (loadedUserRef.current === user.id) return;
    loadedUserRef.current = user.id;

    async function loadConversations() {
      try {
        const { data: convsData, error: convsError } = await supabase
          .from("conversations")
          .select("*, messages(*)")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

        if (convsError) {
          console.error("Error loading conversations:", convsError);
          const initial = createLocalConversation();
          setConversations([initial]);
          setActiveId(initial.id);
          return;
        }

        if (convsData && convsData.length > 0) {
          const loadedConvs = convsData.map((c) => ({
            id: c.id,
            title: c.title,
            createdAt: new Date(c.created_at),
            updatedAt: new Date(c.updated_at),
            isPersisted: true,
            messages: (c.messages || [])
              .sort(
                (a, b) =>
                  new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              )
              .map((m) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                createdAt: new Date(m.created_at),
              })),
          }));

          // Filter out any stale empty "New chat" records from DB if user has other chats
          const nonEmptyConvs = loadedConvs.filter((c) => c.messages.length > 0);

          if (nonEmptyConvs.length > 0) {
            // Start with a fresh empty local chat prompt, backed by user's history
            const fresh = createLocalConversation();
            setConversations([fresh, ...nonEmptyConvs]);
            setActiveId(fresh.id);
          } else {
            // All DB chats were empty, keep just one fresh conversation
            const fresh = createLocalConversation();
            setConversations([fresh]);
            setActiveId(fresh.id);
          }
        } else {
          // User has no conversations in DB yet — start with local unsaved conversation
          const initial = createLocalConversation();
          setConversations([initial]);
          setActiveId(initial.id);
        }
      } catch (err) {
        console.error("Failed to load chat history from Supabase:", err);
        const initial = createLocalConversation();
        setConversations([initial]);
        setActiveId(initial.id);
      }
    }

    loadConversations();
  }, [user]);

  const activeConversation =
    conversations.find((c) => c.id === activeId) ??
    conversations[0] ??
    createLocalConversation();

  // Helper to ensure a conversation is persisted in Supabase before attaching messages
  const ensurePersisted = useCallback(
    async (convId, firstMessageText) => {
      if (!user) return convId;

      const targetConv = conversations.find((c) => c.id === convId);
      if (!targetConv) return convId;

      const newTitle = makeTitle(firstMessageText);

      if (targetConv.isPersisted) {
        if (targetConv.title === "New chat" && firstMessageText) {
          supabase
            .from("conversations")
            .update({ title: newTitle, updated_at: new Date().toISOString() })
            .eq("id", convId)
            .then();

          setConversations((prev) =>
            prev.map((c) => (c.id === convId ? { ...c, title: newTitle } : c))
          );
        }
        return convId;
      }

      // Create new row in Supabase conversations table on first message sent
      try {
        const { data: newConv, error } = await supabase
          .from("conversations")
          .insert({ user_id: user.id, title: newTitle })
          .select()
          .single();

        if (error || !newConv) {
          console.error("Error creating conversation in Supabase:", error);
          return convId;
        }

        const realDbId = newConv.id;

        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  id: realDbId,
                  title: newTitle,
                  isPersisted: true,
                  createdAt: new Date(newConv.created_at),
                  updatedAt: new Date(newConv.updated_at),
                }
              : c
          )
        );

        setActiveId((current) => (current === convId ? realDbId : current));
        return realDbId;
      } catch (err) {
        console.error("Failed to persist conversation:", err);
        return convId;
      }
    },
    [user, conversations]
  );

  const addMessage = useCallback(
    (conversationId, role, content) => {
      const messageId = nanoid();
      const message = {
        id: messageId,
        role,
        content,
        createdAt: new Date(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                messages: [...c.messages, message],
                updatedAt: new Date(),
                title:
                  c.title === "New chat" && role === "user"
                    ? makeTitle(content)
                    : c.title,
              }
            : c
        )
      );

      return messageId;
    },
    []
  );

  const updateMessage = useCallback(
    (conversationId, messageId, content) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === messageId ? { ...m, content } : m
                ),
                updatedAt: new Date(),
              }
            : c
        )
      );
    },
    []
  );

  const streamReply = useCallback(
    async (conversationId, history, dbConvId) => {
      setStatus("submitted");

      const messageId = nanoid();
      const blankMessage = {
        id: messageId,
        role: "assistant",
        content: "",
        createdAt: new Date(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId || c.id === dbConvId
            ? {
                ...c,
                messages: [...c.messages, blankMessage],
                updatedAt: new Date(),
              }
            : c
        )
      );

      let fullResponse = "";

      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
        const response = await fetch(`${backendUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        const targetId = dbConvId || conversationId;

        if (!response.ok || !response.body) {
          const detail = await response.text().catch(() => "");
          const errorMsg =
            detail.trim() ||
            "Sorry, I couldn't reach the AI model. Please try again.";
          updateMessage(targetId, messageId, errorMsg);
          setStatus("idle");
          return;
        }

        setStatus("streaming");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;
          updateMessage(targetId, messageId, fullResponse);
        }
      } catch {
        fullResponse =
          "Something went wrong while generating a response. Please try again.";
        const targetId = dbConvId || conversationId;
        updateMessage(targetId, messageId, fullResponse);
      }

      setStatus("idle");

      // Save complete assistant message to Supabase
      const finalConvId = dbConvId || conversationId;
      if (user && fullResponse.trim()) {
        supabase
          .from("messages")
          .insert({
            conversation_id: finalConvId,
            user_id: user.id,
            role: "assistant",
            content: fullResponse,
          })
          .then();
      }
    },
    [user, updateMessage]
  );

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || status !== "idle") return;
      const trimmed = text.trim();
      const currentConvId = activeConversation.id;

      const userMessage = {
        id: nanoid(),
        role: "user",
        content: trimmed,
        createdAt: new Date(),
      };
      const history = [...activeConversation.messages, userMessage];

      // Add user message to state
      addMessage(currentConvId, "user", trimmed);

      // Ensure conversation is persisted in Supabase
      const dbConvId = await ensurePersisted(currentConvId, trimmed);

      // Persist user message to Supabase
      if (user && dbConvId) {
        supabase
          .from("messages")
          .insert({
            conversation_id: dbConvId,
            user_id: user.id,
            role: "user",
            content: trimmed,
          })
          .then();
      }

      await streamReply(currentConvId, history, dbConvId);
    },
    [activeConversation, status, addMessage, ensurePersisted, streamReply, user]
  );

  const newConversation = useCallback(() => {
    // If active conversation is already empty, stay on it
    if (activeConversation && activeConversation.messages.length === 0) {
      return;
    }

    // Check if there is an existing empty conversation
    const existingEmpty = conversations.find((c) => c.messages.length === 0);
    if (existingEmpty) {
      setActiveId(existingEmpty.id);
      return;
    }

    // Create a new local empty conversation (NOT saved to DB until first message)
    const fresh = createLocalConversation();
    setConversations((prev) => [fresh, ...prev]);
    setActiveId(fresh.id);
  }, [activeConversation, conversations]);

  const selectConversation = useCallback((id) => {
    setActiveId(id);
    setStatus("idle");
  }, []);

  const deleteConversation = useCallback(
    async (id) => {
      const convToDelete = conversations.find((c) => c.id === id);

      if (user && convToDelete?.isPersisted) {
        await supabase.from("conversations").delete().eq("id", id);
      }

      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (next.length === 0) {
          const fresh = createLocalConversation();
          setActiveId(fresh.id);
          return [fresh];
        }
        setActiveId((current) => (current === id ? next[0].id : current));
        return next;
      });
    },
    [user, conversations]
  );

  return {
    activeConversation,
    conversations,
    deleteConversation,
    newConversation,
    selectConversation,
    sendMessage,
    status,
  };
}
