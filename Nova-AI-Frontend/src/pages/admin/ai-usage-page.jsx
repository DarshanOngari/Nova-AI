import { useState, useEffect } from "react";
import { fetchAdminAIUsage } from "@/lib/admin-api";
import { Bot, Zap, CalendarDays, MessageSquare } from "lucide-react";
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

function StatCard({ title, value, icon: Icon, color }) {
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

function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 animate-pulse">
      <div className="h-5 w-48 rounded bg-muted mb-4" />
      <div className="h-64 rounded bg-muted/50" />
    </div>
  );
}

export default function AIUsagePage() {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminAIUsage()
      .then((data) => {
        setUsage(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-sm text-destructive font-medium">Failed to load AI usage</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const chartData = usage?.dailyChart?.map((d) => ({
    ...d,
    label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-foreground">AI Usage</h2>
        <p className="text-sm text-muted-foreground">
          Track how Nova AI is being used across the platform.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
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
              icon={Bot}
              color="bg-violet-500/10 text-violet-500"
            />
            <StatCard
              title="User Messages"
              value={usage?.totalUserMessages}
              icon={MessageSquare}
              color="bg-blue-500/10 text-blue-500"
            />
            <StatCard
              title="AI Responses Today"
              value={usage?.aiToday}
              icon={Zap}
              color="bg-amber-500/10 text-amber-500"
            />
            <StatCard
              title="This Week"
              value={usage?.aiThisWeek}
              icon={CalendarDays}
              color="bg-emerald-500/10 text-emerald-500"
            />
          </>
        )}
      </div>

      {/* Chart */}
      {loading ? (
        <ChartSkeleton />
      ) : chartData && chartData.length > 0 ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Messages — Last 7 Days
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
              >
                <defs>
                  <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                  stroke="var(--color-chart-1)"
                  fill="url(#aiGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="userMessages"
                  name="User Messages"
                  stroke="var(--color-chart-2)"
                  fill="url(#userGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
