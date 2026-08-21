import { useState, useEffect } from "react";
import {
  fetchAdminConversations,
  fetchAdminConversationMessages,
} from "@/lib/admin-api";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ArrowLeft,
  User,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3">
          <div className="h-4 flex-1 rounded bg-muted" />
          <div className="h-4 w-24 rounded bg-muted hidden sm:block" />
          <div className="h-4 w-12 rounded bg-muted" />
          <div className="h-4 w-24 rounded bg-muted hidden md:block" />
        </div>
      ))}
    </div>
  );
}

function MessageViewer({ conversationId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchAdminConversationMessages(conversationId)
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [conversationId]);

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-6 w-48 rounded bg-muted" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-sm text-destructive font-medium">Failed to load messages</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in-0 slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-muted/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="shrink-0 gap-1.5 transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">
            {data?.conversation?.title || "Conversation"}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {data?.conversation?.username} • {data?.messages?.length || 0} messages
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-3 max-h-[calc(100vh-14rem)] overflow-y-auto">
        {data?.messages?.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No messages in this conversation.</p>
          </div>
        ) : (
          data?.messages?.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 animate-in fade-in-0 duration-200 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                  <Bot className="size-3.5" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <p
                  className={`text-[10px] mt-1.5 ${
                    msg.role === "user"
                      ? "text-primary-foreground/60"
                      : "text-muted-foreground"
                  }`}
                >
                  {format(new Date(msg.created_at), "MMM d, h:mm a")}
                </p>
              </div>
              {msg.role === "user" && (
                <div className="flex size-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground shrink-0 mt-0.5">
                  <User className="size-3.5" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedConvId, setSelectedConvId] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchAdminConversations(page, 20)
      .then((data) => {
        setConversations(data.conversations || []);
        setPagination(data.pagination || null);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  if (selectedConvId) {
    return (
      <div className="max-w-4xl mx-auto">
        <MessageViewer
          conversationId={selectedConvId}
          onBack={() => setSelectedConvId(null)}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-sm text-destructive font-medium">Failed to load conversations</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-6xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-foreground">Conversations</h2>
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Loading…"
            : `${pagination?.total || 0} total conversation${(pagination?.total || 0) !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_1fr_auto_auto] md:grid-cols-[1fr_1fr_auto_auto_auto] gap-2 px-4 py-3 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Title</span>
          <span className="hidden sm:block">User</span>
          <span className="text-right">Msgs</span>
          <span className="text-right hidden sm:block">Created</span>
          <span className="text-right hidden md:block">Updated</span>
        </div>

        {/* Body */}
        {loading ? (
          <TableSkeleton />
        ) : conversations.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <MessageSquare className="size-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No conversations found.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConvId(conv.id)}
                className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_1fr_auto_auto] md:grid-cols-[1fr_1fr_auto_auto_auto] gap-2 px-4 py-3 text-sm items-center w-full text-left transition-all duration-150 hover:bg-muted/30 group"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate text-foreground group-hover:text-primary transition-colors">
                    {conv.title || "Untitled"}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate sm:hidden">
                    {conv.username}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 min-w-0">
                  <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                    {conv.username?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <p className="text-muted-foreground truncate">{conv.username}</p>
                </div>
                <p className="text-right tabular-nums text-muted-foreground">
                  {conv.messageCount}
                </p>
                <p className="text-right text-muted-foreground text-xs hidden sm:block">
                  {format(new Date(conv.createdAt), "MMM d, yyyy")}
                </p>
                <p className="text-right text-muted-foreground text-xs hidden md:block">
                  {format(new Date(conv.updatedAt), "MMM d, h:mm a")}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="gap-1 transition-all duration-200 hover:scale-105"
              >
                <ChevronLeft className="size-4" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="gap-1 transition-all duration-200 hover:scale-105"
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
