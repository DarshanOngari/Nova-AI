import { useState, useEffect, useMemo, useCallback } from "react";
import {
  fetchAdminUsers,
  updateUserRole,
  deleteAdminUser,
} from "@/lib/admin-api";
import { useAuth } from "@/lib/auth-context";
import {
  Search,
  ArrowUpDown,
  RefreshCw,
  Shield,
  ShieldAlert,
  Trash2,
  MoreVertical,
  MessageSquare,
  User,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_80px_48px] sm:grid-cols-[1.2fr_1.5fr_80px_48px] md:grid-cols-[1.2fr_1.5fr_80px_90px_120px_48px] gap-4 items-center py-2"
        >
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-muted shrink-0" />
            <div className="h-4 flex-1 rounded bg-muted" />
          </div>
          <div className="h-4 rounded bg-muted hidden sm:block" />
          <div className="h-4 w-12 rounded bg-muted ml-auto" />
          <div className="h-4 w-12 rounded bg-muted ml-auto hidden md:block" />
          <div className="h-4 w-20 rounded bg-muted ml-auto hidden md:block" />
          <div className="size-8 rounded bg-muted ml-auto" />
        </div>
      ))}
    </div>
  );
}

export default function UsersPage({ onFilterUserConversations }) {
  const { userProfile: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Sorting
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  // Deletion state
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Updating role state
  const [updatingRoleId, setUpdatingRoleId] = useState(null);

  const loadUsers = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchAdminUsers();
      setUsers(data.users || []);
      setError(null);
      if (isManual) toast.success("Users list refreshed");
    } catch (err) {
      setError(err.message);
      if (isManual) toast.error(`Failed to refresh: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const handleRoleChange = async (user, newRole) => {
    if (user.id === currentAdmin?.id && newRole !== "admin") {
      toast.error("You cannot revoke your own admin role.");
      return;
    }

    setUpdatingRoleId(user.id);
    try {
      await updateUserRole(user.id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
      toast.success(`Updated ${user.username}'s role to ${newRole}`);
    } catch (err) {
      toast.error(`Failed to update role: ${err.message}`);
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteAdminUser(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      toast.success(`User ${userToDelete.username} deleted successfully`);
      setUserToDelete(null);
    } catch (err) {
      toast.error(`Failed to delete user: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Role filter
    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let aVal, bVal;
      switch (sortField) {
        case "username":
          aVal = a.username?.toLowerCase() || "";
          bVal = b.username?.toLowerCase() || "";
          break;
        case "email":
          aVal = a.email?.toLowerCase() || "";
          bVal = b.email?.toLowerCase() || "";
          break;
        case "conversationCount":
          aVal = a.conversationCount || 0;
          bVal = b.conversationCount || 0;
          break;
        case "messageCount":
          aVal = a.messageCount || 0;
          bVal = b.messageCount || 0;
          break;
        case "lastActiveAt":
          aVal = new Date(a.lastActiveAt || a.created_at).getTime();
          bVal = new Date(b.lastActiveAt || b.created_at).getTime();
          break;
        default:
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, search, roleFilter, sortField, sortDir]);

  if (error && users.length === 0) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center max-w-lg mx-auto">
          <p className="text-sm text-destructive font-medium">Failed to load users</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadUsers(true)}
            className="mt-4 gap-2"
          >
            <RefreshCw className="size-3.5" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Users Management</h2>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading users…" : `${filteredUsers.length} of ${users.length} registered user${users.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadUsers(true)}
            disabled={refreshing || loading}
            className="gap-2 shrink-0 transition-all duration-200 hover:scale-105"
          >
            <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by username or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins Only</option>
            <option value="user">Users Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_80px_48px] sm:grid-cols-[1.2fr_1.5fr_80px_48px] md:grid-cols-[1.2fr_1.5fr_80px_90px_120px_48px] gap-4 px-4 py-3 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider items-center">
          <button
            onClick={() => handleSort("username")}
            className="flex items-center gap-1 hover:text-foreground transition-colors text-left"
          >
            User
            <ArrowUpDown className="size-3" />
          </button>
          <button
            onClick={() => handleSort("email")}
            className="flex items-center gap-1 hover:text-foreground transition-colors text-left hidden sm:flex"
          >
            Email
            <ArrowUpDown className="size-3" />
          </button>
          <button
            onClick={() => handleSort("conversationCount")}
            className="flex items-center gap-1 hover:text-foreground transition-colors text-right justify-end"
          >
            Chats
            <ArrowUpDown className="size-3" />
          </button>
          <button
            onClick={() => handleSort("messageCount")}
            className="flex items-center gap-1 hover:text-foreground transition-colors text-right justify-end hidden md:flex"
          >
            Messages
            <ArrowUpDown className="size-3" />
          </button>
          <button
            onClick={() => handleSort("lastActiveAt")}
            className="flex items-center gap-1 hover:text-foreground transition-colors text-right justify-end hidden md:flex"
          >
            Last Active
            <ArrowUpDown className="size-3" />
          </button>
          <span className="text-right">Actions</span>
        </div>

        {/* Table body */}
        {loading && users.length === 0 ? (
          <TableSkeleton />
        ) : filteredUsers.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <User className="size-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">
              {search || roleFilter !== "all"
                ? "No users match the current filter."
                : "No registered users found."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredUsers.map((u) => {
              const isCurrent = u.id === currentAdmin?.id;
              const isUpdating = updatingRoleId === u.id;

              return (
                <div
                  key={u.id}
                  className="grid grid-cols-[1fr_80px_48px] sm:grid-cols-[1.2fr_1.5fr_80px_48px] md:grid-cols-[1.2fr_1.5fr_80px_90px_120px_48px] gap-4 px-4 py-3 text-sm items-center transition-colors duration-150 hover:bg-muted/30"
                >
                  {/* User Profile */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                      {u.username?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium truncate text-foreground">
                          {u.username || "—"}
                        </p>
                        {isCurrent && (
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded font-normal">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate sm:hidden">
                        {u.email}
                      </p>
                    </div>
                    {u.role === "admin" && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0 flex items-center gap-1">
                        <Shield className="size-2.5" />
                        Admin
                      </span>
                    )}
                  </div>

                  {/* Email */}
                  <p className="text-muted-foreground truncate hidden sm:block text-xs">
                    {u.email}
                  </p>

                  {/* Chats count */}
                  <p className="text-right tabular-nums text-foreground font-medium">
                    {u.conversationCount}
                  </p>

                  {/* Messages count */}
                  <p className="text-right tabular-nums text-muted-foreground hidden md:block">
                    {u.messageCount}
                  </p>

                  {/* Last active date */}
                  <div className="text-right text-xs text-muted-foreground hidden md:block">
                    <span title={format(new Date(u.lastActiveAt || u.created_at), "PPpp")}>
                      {formatDistanceToNow(new Date(u.lastActiveAt || u.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  {/* Actions Dropdown */}
                  <div className="text-right flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 transition-colors hover:bg-muted"
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <RefreshCw className="size-3.5 animate-spin" />
                          ) : (
                            <MoreVertical className="size-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {onFilterUserConversations && (
                          <DropdownMenuItem
                            onClick={() => onFilterUserConversations(u.id, u.username)}
                            className="gap-2 cursor-pointer"
                          >
                            <MessageSquare className="size-4 text-emerald-500" />
                            View Conversations ({u.conversationCount})
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {u.role === "admin" ? (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(u, "user")}
                            disabled={isCurrent}
                            className="gap-2 cursor-pointer text-amber-600 dark:text-amber-400"
                          >
                            <ShieldAlert className="size-4" />
                            Demote to User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(u, "admin")}
                            className="gap-2 cursor-pointer text-primary"
                          >
                            <Shield className="size-4" />
                            Promote to Admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setUserToDelete(u)}
                          disabled={isCurrent}
                          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="size-5" />
              Delete User Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user{" "}
              <strong className="text-foreground">{userToDelete?.username}</strong> ({userToDelete?.email})?
              <br />
              <br />
              This will permanently delete their account, all conversations, and all chat history. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setUserToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
