import { useState, useEffect, useMemo } from "react";
import { fetchAdminUsers } from "@/lib/admin-api";
import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3">
          <div className="h-4 flex-1 rounded bg-muted" />
          <div className="h-4 w-32 rounded bg-muted hidden sm:block" />
          <div className="h-4 w-16 rounded bg-muted" />
          <div className="h-4 w-16 rounded bg-muted hidden md:block" />
          <div className="h-4 w-24 rounded bg-muted hidden lg:block" />
        </div>
      ))}
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    fetchAdminUsers()
      .then((data) => {
        setUsers(data.users || []);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let aVal, bVal;
      switch (sortField) {
        case "username":
          aVal = a.username?.toLowerCase() || "";
          bVal = b.username?.toLowerCase() || "";
          break;
        case "conversationCount":
          aVal = a.conversationCount;
          bVal = b.conversationCount;
          break;
        case "messageCount":
          aVal = a.messageCount;
          bVal = b.messageCount;
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
  }, [users, search, sortField, sortDir]);

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-sm text-destructive font-medium">Failed to load users</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Users</h2>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${users.length} registered user${users.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_1fr_auto_auto] md:grid-cols-[1fr_1fr_auto_auto_auto] gap-2 px-4 py-3 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <button
            onClick={() => handleSort("username")}
            className="flex items-center gap-1 hover:text-foreground transition-colors text-left"
          >
            Username
            <ArrowUpDown className="size-3" />
          </button>
          <span className="hidden sm:block">Email</span>
          <button
            onClick={() => handleSort("conversationCount")}
            className="flex items-center gap-1 hover:text-foreground transition-colors text-right"
          >
            Chats
            <ArrowUpDown className="size-3" />
          </button>
          <button
            onClick={() => handleSort("messageCount")}
            className="flex items-center gap-1 hover:text-foreground transition-colors text-right hidden md:flex"
          >
            Messages
            <ArrowUpDown className="size-3" />
          </button>
          <button
            onClick={() => handleSort("created_at")}
            className="flex items-center gap-1 hover:text-foreground transition-colors text-right hidden md:flex"
          >
            Joined
            <ArrowUpDown className="size-3" />
          </button>
        </div>

        {/* Table body */}
        {loading ? (
          <TableSkeleton />
        ) : filteredUsers.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {search ? "No users match your search." : "No users found."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_1fr_auto_auto] md:grid-cols-[1fr_1fr_auto_auto_auto] gap-2 px-4 py-3 text-sm items-center transition-colors duration-150 hover:bg-muted/30"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
                    {user.username?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate text-foreground">
                      {user.username || "—"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate sm:hidden">
                      {user.email}
                    </p>
                  </div>
                  {user.role === "admin" && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground truncate hidden sm:block">{user.email}</p>
                <p className="text-right tabular-nums text-muted-foreground">{user.conversationCount}</p>
                <p className="text-right tabular-nums text-muted-foreground hidden md:block">{user.messageCount}</p>
                <p className="text-right text-muted-foreground text-xs hidden md:block">
                  {format(new Date(user.created_at), "MMM d, yyyy")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
