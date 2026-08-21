import { useState, useEffect, useCallback } from "react";
import { fetchAdminStats } from "@/lib/admin-api";
import {
  Users,
  MessageSquare,
  Bot,
  Zap,
  UserCheck,
  MessagesSquare,
  RefreshCw,
  Clock,
  UserPlus,
  Server,
  Database,
  Cpu,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

function StatCard({ title, value, icon: Icon, subtitle, color, isNumeric = true }) {
  return (
    <div className="group rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {value !== null && value !== undefined
              ? isNumeric && typeof value === "number"
                ? value.toLocaleString()
                : value
              : "—"}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div
          className={`flex size-10 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110 ${
            color || "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-7 w-16 rounded bg-muted" />
          <div className="h-2.5 w-20 rounded bg-muted" />
        </div>
        <div className="size-10 rounded-lg bg-muted" />
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigateSection }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchAdminStats();
      setStats(data);
      setError(null);
      if (isManual) {
        toast.success("Dashboard data refreshed");
      }
    } catch (err) {
      setError(err.message);
      if (isManual) {
        toast.error(`Failed to refresh: ${err.message}`);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (error && !stats) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center max-w-lg mx-auto">
          <p className="text-sm text-destructive font-medium">Failed to load dashboard</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            className="mt-4 gap-2"
          >
            <RefreshCw className="size-3.5" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Format chart dates
  const chartData = stats?.dailyChart?.map((d) => ({
    ...d,
    label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            Overview
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
              Live Real-Time
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Complete real-time telemetry and metrics for the Nova AI platform.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => loadData(true)}
          disabled={refreshing || loading}
          className="gap-2 shrink-0 self-start sm:self-auto transition-all duration-200 hover:scale-105"
        >
          <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </Button>
      </div>

      {/* Primary Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && !stats ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Users"
              value={stats?.totalUsers}
              subtitle="Registered platform accounts"
              icon={Users}
              color="bg-blue-500/10 text-blue-500"
            />
            <StatCard
              title="Conversations"
              value={stats?.totalConversations}
              subtitle="Active & archived threads"
              icon={MessageSquare}
              color="bg-emerald-500/10 text-emerald-500"
            />
            <StatCard
              title="Total AI Requests"
              value={stats?.totalAiRequests}
              subtitle="AI assistant responses delivered"
              icon={Bot}
              color="bg-violet-500/10 text-violet-500"
            />
            <StatCard
              title="AI Requests Today"
              value={stats?.messagesToday}
              subtitle="Generated since midnight UTC"
              icon={Zap}
              color="bg-amber-500/10 text-amber-500"
            />
            <StatCard
              title="Active Users (7D)"
              value={stats?.activeUsersCount}
              subtitle="Users active in last 7 days"
              icon={UserCheck}
              color="bg-cyan-500/10 text-cyan-500"
            />
            <StatCard
              title="Avg. Messages / Thread"
              value={stats?.avgMessagesPerConversation}
              subtitle="Engagement depth per chat"
              icon={MessagesSquare}
              color="bg-indigo-500/10 text-indigo-500"
            />
          </>
        )}
      </div>

      {/* Main Chart Section */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              AI Request Volume — Last 7 Days
            </h3>
            <p className="text-xs text-muted-foreground">
              Daily frequency of Gemini AI completions generated across all users.
            </p>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground">
            Last 7 Days
          </span>
        </div>

        {loading && !stats ? (
          <div className="h-64 rounded bg-muted/40 animate-pulse" />
        ) : chartData && chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  labelStyle={{ fontWeight: 600 }}
                  cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
                />
                <Bar
                  dataKey="count"
                  name="AI Responses"
                  fill="var(--color-primary)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
            No activity recorded in the last 7 days.
          </div>
        )}
      </div>

      {/* Two Column Section: Recent Conversations & Recent Signups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Conversations */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Recent Conversations
              </h3>
            </div>
            {onNavigateSection && (
              <button
                onClick={() => onNavigateSection("conversations")}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
              >
                View all <ArrowRight className="size-3" />
              </button>
            )}
          </div>

          <div className="divide-y divide-border">
            {stats?.recentConversations?.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No recent conversations found.
              </p>
            ) : (
              stats?.recentConversations?.map((conv) => (
                <div
                  key={conv.id}
                  className="py-3 flex items-center justify-between gap-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate text-foreground">
                      {conv.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      by <span className="font-medium text-foreground">{conv.username}</span> • {conv.messageCount} msg{conv.messageCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums">
                    {conv.updatedAt
                      ? formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })
                      : "—"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Signups */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="size-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Recent Signups
              </h3>
            </div>
            {onNavigateSection && (
              <button
                onClick={() => onNavigateSection("users")}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
              >
                View all <ArrowRight className="size-3" />
              </button>
            )}
          </div>

          <div className="divide-y divide-border">
            {stats?.recentUsers?.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No users found.
              </p>
            ) : (
              stats?.recentUsers?.map((u) => (
                <div
                  key={u.id}
                  className="py-3 flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
                      {u.username?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate text-foreground">
                        {u.username}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {u.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {u.role === "admin" && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        Admin
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground tabular-nums hidden sm:inline">
                      {format(new Date(u.created_at), "MMM d")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* System Infrastructure & AI Health Card */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Server className="size-4 text-primary" />
          Platform Status & Configuration
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-muted/40 border border-border flex items-center gap-3">
            <Cpu className="size-5 text-violet-500 shrink-0" />
            <div>
              <p className="font-medium text-foreground">AI Intelligence</p>
              <p className="text-muted-foreground">Gemini 3.5 Flash Streaming</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/40 border border-border flex items-center gap-3">
            <Database className="size-5 text-emerald-500 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Supabase Database</p>
              <p className="text-muted-foreground">Postgres 17 + RLS Security</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/40 border border-border flex items-center gap-3">
            <Sparkles className="size-5 text-amber-500 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Admin API State</p>
              <p className="text-muted-foreground">Authenticated & Protected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
