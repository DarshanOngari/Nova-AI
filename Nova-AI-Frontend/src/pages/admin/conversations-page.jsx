import { useState, useEffect, useCallback } from "react";
import {
  fetchAdminConversations,
  fetchAdminConversationMessages,
  deleteAdminConversation,
} from "@/lib/admin-api";
import { format, formatDistanceToNow } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ArrowLeft,
  User,
  Bot,
  RefreshCw,
  Search,
  Trash2,
  Copy,
  Check,
  X,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-2">
          <div className="h-4 flex-1 rounded bg-muted" />
          <div className="h-4 w-28 rounded bg-muted hidden sm:block" />
          <div className="h-4 w-12 rounded bg-muted" />
          <div className="h-4 w-24 rounded bg-muted hidden md:block" />
        </div>
      ))}
    </div>
  );
}

function MessageViewer({ conversationId, onBack, onDelete }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminConversationMessages(conversationId);
      setData(res);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const copyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Message copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyFullTranscript = () => {
    if (!data?.messages?.length) return;
    const transcript = data.messages
      .map(
        (m) =>
          `[${m.role.toUpperCase()}] (${new Date(m.created_at).toLocaleString()}):\n${m.content}\n`
      )
      .join("\n---\n\n");

    navigator.clipboard.writeText(transcript);
    setCopiedAll(true);
    toast.success("Full conversation transcript copied");
    setTimeout(() => setCopiedAll(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 rounded bg-muted" />
          <div className="h-8 w-24 rounded bg-muted" />
        </div>
        <div className="space-y-3 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted/60" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center max-w-md mx-auto">
          <p className="text-sm text-destructive font-medium">Failed to load conversation messages</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={onBack}>
              Back to list
            </Button>
            <Button variant="default" size="sm" onClick={loadMessages}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in-0 slide-in-from-right-4 duration-300">
      {/* Viewer Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 bg-muted/20">
        <div className="flex items-center gap-3 min-w-0 flex-1">
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
            <p className="text-sm font-semibold truncate text-foreground">
              {data?.conversation?.title || "Untitled Conversation"}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              User: <span className="font-medium text-foreground">{data?.conversation?.username}</span> ({data?.conversation?.email || "No email"}) • {data?.messages?.length || 0} messages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={copyFullTranscript}
            className="gap-1.5 text-xs hidden sm:flex"
            title="Copy full conversation transcript"
          >
            {copiedAll ? <Check className="size-3.5 text-emerald-500" /> : <FileText className="size-3.5" />}
            <span>Transcript</span>
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(conversationId)}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5"
            >
              <Trash2 className="size-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          )}
        </div>
      </div>

      {/* Messages Thread */}
      <div className="p-4 sm:p-6 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
        {data?.messages?.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare className="size-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No messages in this conversation.</p>
          </div>
        ) : (
          data?.messages?.map((msg) => {
            const isUser = msg.role === "user";
            const isCopied = copiedId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 group animate-in fade-in-0 duration-200 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-0.5 shadow-sm">
                    <Bot className="size-4" />
                  </div>
                )}

                <div
                  className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card border border-border text-foreground rounded-tl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                  <div className="flex items-center justify-between gap-4 mt-2 pt-1 border-t border-current/10">
                    <p
                      className={`text-[10px] tabular-nums ${
                        isUser
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {format(new Date(msg.created_at), "MMM d, yyyy • h:mm a")}
                    </p>

                    <button
                      onClick={() => copyMessage(msg.id, msg.content)}
                      className={`opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 ${
                        isUser ? "text-primary-foreground/80" : "text-muted-foreground"
                      }`}
                      title="Copy message content"
                    >
                      {isCopied ? (
                        <Check className="size-3 text-emerald-400" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </div>
                </div>

                {isUser && (
                  <div className="flex size-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground shrink-0 mt-0.5 shadow-sm">
                    <User className="size-4" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function ConversationsPage({ initialUserId, initialUsername, onClearUserFilter }) {
  const [conversations, setConversations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [userIdFilter, setUserIdFilter] = useState(initialUserId || "");
  const [userFilterName, setUserFilterName] = useState(initialUsername || "");

  // Selection
  const [selectedConvId, setSelectedConvId] = useState(null);

  // Delete modal
  const [convToDelete, setConvToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (initialUserId) {
      setUserIdFilter(initialUserId);
      setUserFilterName(initialUsername || "");
      setPage(1);
    }
  }, [initialUserId, initialUsername]);

  const loadConversations = useCallback(
    async (isManual = false) => {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      try {
        const data = await fetchAdminConversations(page, 20, search, userIdFilter);
        setConversations(data.conversations || []);
        setPagination(data.pagination || null);
        setError(null);
        if (isManual) toast.success("Conversations refreshed");
      } catch (err) {
        setError(err.message);
        if (isManual) toast.error(`Failed to refresh: ${err.message}`);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, userIdFilter]
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleClearFilter = () => {
    setUserIdFilter("");
    setUserFilterName("");
    setPage(1);
    if (onClearUserFilter) onClearUserFilter();
  };

  const handleDeleteConversation = async () => {
    if (!convToDelete) return;
    setIsDeleting(true);
    try {
      await deleteAdminConversation(convToDelete.id);
      setConversations((prev) => prev.filter((c) => c.id !== convToDelete.id));
      if (pagination) {
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, (prev?.total || 1) - 1),
        }));
      }
      toast.success("Conversation deleted successfully");
      if (selectedConvId === convToDelete.id) {
        setSelectedConvId(null);
      }
      setConvToDelete(null);
    } catch (err) {
      toast.error(`Failed to delete conversation: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (selectedConvId) {
    return (
      <div className="max-w-4xl mx-auto p-2 sm:p-4">
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <MessageViewer
            conversationId={selectedConvId}
            onBack={() => setSelectedConvId(null)}
            onDelete={(id) => {
              const c = conversations.find((item) => item.id === id);
              setConvToDelete(c || { id, title: "this conversation" });
            }}
          />
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!convToDelete} onOpenChange={(open) => !open && setConvToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive flex items-center gap-2">
                <Trash2 className="size-5" />
                Delete Conversation
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete conversation{" "}
                <strong className="text-foreground">{convToDelete?.title}</strong>? All messages in this thread will be permanently erased.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setConvToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConversation}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Conversations Log</h2>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading conversations…"
              : `${pagination?.total || 0} total conversation${(pagination?.total || 0) !== 1 ? "s" : ""}`}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => loadConversations(true)}
          disabled={refreshing || loading}
          className="gap-2 shrink-0 self-start sm:self-auto transition-all duration-200 hover:scale-105"
        >
          <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
        </Button>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations by title…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
          />
        </div>

        {userIdFilter && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 text-xs text-primary">
            <span>Filtered by: <strong>{userFilterName || "User"}</strong></span>
            <button
              onClick={handleClearFilter}
              className="p-0.5 rounded hover:bg-primary/20 transition-colors"
              title="Clear filter"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Conversations Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1.5fr_1.2fr_auto_auto] md:grid-cols-[1.8fr_1.2fr_auto_auto_auto] gap-2 px-4 py-3 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider items-center">
          <span>Title</span>
          <span className="hidden sm:block">User</span>
          <span className="text-right">Messages</span>
          <span className="text-right hidden sm:block">Created</span>
          <span className="text-right hidden md:block">Updated</span>
        </div>

        {/* Table body */}
        {loading && conversations.length === 0 ? (
          <TableSkeleton />
        ) : conversations.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <MessageSquare className="size-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-foreground">No conversations found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || userIdFilter
                ? "Try clearing filters to view all conversations."
                : "Users haven't started any conversations yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1.5fr_1.2fr_auto_auto] md:grid-cols-[1.8fr_1.2fr_auto_auto_auto] gap-2 px-4 py-3 text-sm items-center transition-colors duration-150 hover:bg-muted/30 group"
              >
                {/* Title & Clickable link */}
                <button
                  onClick={() => setSelectedConvId(conv.id)}
                  className="min-w-0 text-left"
                >
                  <p className="font-medium truncate text-foreground group-hover:text-primary transition-colors">
                    {conv.title || "Untitled"}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate sm:hidden">
                    {conv.username}
                  </p>
                </button>

                {/* User */}
                <div className="hidden sm:flex items-center gap-2 min-w-0">
                  <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                    {conv.username?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <p className="text-muted-foreground truncate text-xs">{conv.username}</p>
                </div>

                {/* Message count */}
                <p className="text-right tabular-nums text-foreground font-medium">
                  {conv.messageCount}
                </p>

                {/* Created At */}
                <p className="text-right text-muted-foreground text-xs hidden sm:block tabular-nums">
                  {format(new Date(conv.createdAt), "MMM d, yyyy")}
                </p>

                {/* Updated At */}
                <div className="text-right text-xs text-muted-foreground hidden md:flex items-center justify-end gap-2">
                  <span title={format(new Date(conv.updatedAt), "PPpp")}>
                    {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConvToDelete(conv);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-destructive hover:bg-destructive/10 rounded transition-all ml-1"
                    title="Delete conversation"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 bg-muted/10">
            <p className="text-xs text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="gap-1 transition-all duration-200 hover:scale-105"
              >
                <ChevronLeft className="size-4" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages || loading}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!convToDelete} onOpenChange={(open) => !open && setConvToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="size-5" />
              Delete Conversation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete conversation{" "}
              <strong className="text-foreground">{convToDelete?.title}</strong>? All messages in this conversation thread will be permanently erased.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConvToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConversation}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
