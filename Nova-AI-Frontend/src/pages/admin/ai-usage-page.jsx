import { useState, useEffect, useCallback } from "react";
import { fetchAdminAIUsage } from "@/lib/admin-api";
import {
  Bot,
  Zap,
  CalendarDays,
  MessageSquare,
  RefreshCw,
  Trophy,
  Activity,
  Sparkles,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="group rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {value !== null && value !== undefined ? value.toLocaleString() : "—"}
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
        </div>
        <div className="size-10 rounded-lg bg-muted" />
      </div>
    </div>
  );
}

export default function AIUsagePage() {
  const [usage, setUsage] = useState(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadUsage = useCallback(
    async (isManual = false) => {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      try {
        const data = await fetchAdminAIUsage(days);
        setUsage(data);
        setError(null);
        if (isManual) toast.success("AI usage metrics refreshed");
      } catch (err) {
        setError(err.message);
        if (isManual) toast.error(`Failed to refresh: ${err.message}`);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [days]
  );

  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  if (error && !usage) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center max-w-md mx-auto">
          <p className="text-sm text-destructive font-medium">Failed to load AI usage metrics</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadUsage(true)}
            className="mt-4 gap-2"
          >
            <RefreshCw className="size-3.5" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const chartData = usage?.dailyChart?.map((d) => {
    const isHourly = d.date.includes("T");
    let label = "";
    let fullDate = "";

    if (isHourly) {
      const parsedDate = new Date(d.date);
      label = format(parsedDate, "h a");
      fullDate = format(parsedDate, "PPpp");
    } else {
      const parsedDate = new Date(d.date + "T00:00:00");
      label = days === 30 ? format(parsedDate, "MMM d") : format(parsedDate, "EEE, MMM d");
      fullDate = format(parsedDate, "PPPP");
    }

    return {
      ...d,
      label,
      fullDate,
    };
  });

  const totalInteractions =
    (usage?.totalAiResponses || 0) + (usage?.totalUserMessages || 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            AI Analytics & Usage
            <Sparkles className="size-4 text-violet-500" />
          </h2>
          <p className="text-sm text-muted-foreground">
            Track user prompts, AI response volume, and token interaction patterns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe Selector */}
          <div className="flex items-center rounded-lg border border-border bg-card p-1 text-xs">
            {[
              { label: "1D", value: 1 },
              { label: "7D", value: 7 },
              { label: "30D", value: 30 },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setDays(tab.value)}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  days === tab.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadUsage(true)}
            disabled={refreshing || loading}
            className="gap-2 shrink-0 transition-all duration-200 hover:scale-105"
          >
            <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && !usage ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total AI Responses"
              value={usage?.totalAiResponses}
              subtitle="Completions generated"
              icon={Bot}
              color="bg-violet-500/10 text-violet-500"
            />
            <StatCard
              title="Total User Prompts"
              value={usage?.totalUserMessages}
              subtitle="Inbound user queries"
              icon={MessageSquare}
              color="bg-blue-500/10 text-blue-500"
            />
            <StatCard
              title="AI Responses Today"
              value={usage?.aiToday}
              subtitle="Since midnight UTC"
              icon={Zap}
              color="bg-amber-500/10 text-amber-500"
            />
            <StatCard
              title="AI Responses This Week"
              value={usage?.aiThisWeek}
              subtitle="Rolling current week"
              icon={CalendarDays}
              color="bg-emerald-500/10 text-emerald-500"
            />
          </>
        )}
      </div>

      {/* Chart Section */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Conversation Turn History {days === 1 ? "— Last 24 Hours" : `— Last ${days} Days`}
            </h3>
            <p className="text-xs text-muted-foreground">
              {days === 1
                ? "Hourly breakdown comparing User Messages vs AI Assistant Responses."
                : "Daily breakdown comparing User Messages vs AI Assistant Responses."}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-violet-500" /> AI Responses
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-blue-500" /> User Prompts
            </span>
          </div>
        </div>

        {loading && !usage ? (
          <div className="h-72 rounded bg-muted/40 animate-pulse" />
        ) : chartData && chartData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
              >
                <defs>
                  <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  minTickGap={16}
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
                  labelFormatter={(label, items) => items?.[0]?.payload?.fullDate || label}
                  cursor={{ stroke: "var(--color-muted-foreground)", strokeDasharray: "3 3" }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                />
                <Area
                  type="monotone"
                  dataKey="aiResponses"
                  name="AI Responses"
                  stroke="#8b5cf6"
                  fill="url(#aiGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="userMessages"
                  name="User Messages"
                  stroke="#3b82f6"
                  fill="url(#userGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
            No message activity recorded in this timeframe.
          </div>
        )}
      </div>

      {/* Top Active Users Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground">
              Most Active Users {days === 1 ? "(Last 24 Hours)" : `(Last ${days} Days)`}
            </h3>
          </div>

          <div className="divide-y divide-border">
            {usage?.topUsers?.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                No user activity recorded in the past {days === 1 ? "24 hours" : `${days} days`}.
              </p>
            ) : (
              usage?.topUsers?.map((u, idx) => {
                const percentage = totalInteractions
                  ? Math.round((u.messageCount / totalInteractions) * 100)
                  : 0;

                return (
                  <div
                    key={u.id}
                    className="py-3 flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
                        idx === 0 ? "bg-amber-500 text-black" :
                        idx === 1 ? "bg-slate-300 text-black dark:bg-slate-600 dark:text-white" :
                        idx === 2 ? "bg-amber-700 text-white" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
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

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="font-medium text-foreground tabular-nums">
                          {u.messageCount} msg{u.messageCount !== 1 ? "s" : ""}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {percentage}% of platform traffic
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Traffic Efficiency Card */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Conversation Ratio
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">AI Response Rate:</span>
              <span className="font-bold text-foreground">
                {usage?.totalUserMessages && usage?.totalAiResponses
                  ? (usage.totalAiResponses / usage.totalUserMessages).toFixed(2)
                  : "1.00"}{" "}
                AI/User turn
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden flex">
              <div
                className="bg-violet-500 h-full transition-all"
                style={{
                  width: `${
                    totalInteractions
                      ? Math.round(((usage?.totalAiResponses || 0) / totalInteractions) * 100)
                      : 50
                  }%`,
                }}
              />
              <div
                className="bg-blue-500 h-full transition-all"
                style={{
                  width: `${
                    totalInteractions
                      ? Math.round(((usage?.totalUserMessages || 0) / totalInteractions) * 100)
                      : 50
                  }%`,
                }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              A 1:1 turn ratio indicates stable streaming completions where each user query receives a corresponding Nova response.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
