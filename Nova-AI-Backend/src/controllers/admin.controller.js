import { supabaseAdmin } from "../services/supabase.service.js";

/**
 * GET /api/admin/stats
 * Returns dashboard overview stats + daily message counts for last 7 days.
 */
export async function getStats(req, res) {
  try {
    // Total users
    const { count: totalUsers, error: usersErr } = await supabaseAdmin
      .from("users")
      .select("id", { count: "exact", head: true });

    if (usersErr) throw usersErr;

    // Total conversations
    const { count: totalConversations, error: convsErr } = await supabaseAdmin
      .from("conversations")
      .select("id", { count: "exact", head: true });

    if (convsErr) throw convsErr;

    // Total messages (AI requests = assistant messages)
    const { count: totalMessages, error: msgsErr } = await supabaseAdmin
      .from("messages")
      .select("id", { count: "exact", head: true });

    if (msgsErr) throw msgsErr;

    // AI requests (assistant messages only)
    const { count: totalAiRequests, error: aiErr } = await supabaseAdmin
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("role", "assistant");

    if (aiErr) throw aiErr;

    // Messages today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count: messagesToday, error: todayErr } = await supabaseAdmin
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("role", "assistant")
      .gte("created_at", todayStart.toISOString());

    if (todayErr) throw todayErr;

    // Daily message counts for last 7 days (for chart)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data: recentMessages, error: recentErr } = await supabaseAdmin
      .from("messages")
      .select("created_at")
      .eq("role", "assistant")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    if (recentErr) throw recentErr;

    // Aggregate by day
    const dailyCounts = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split("T")[0];
      dailyCounts[key] = 0;
    }

    for (const msg of recentMessages || []) {
      const key = new Date(msg.created_at).toISOString().split("T")[0];
      if (dailyCounts[key] !== undefined) {
        dailyCounts[key]++;
      }
    }

    const dailyChart = Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count,
    }));

    return res.json({
      totalUsers: totalUsers || 0,
      totalConversations: totalConversations || 0,
      totalMessages: totalMessages || 0,
      totalAiRequests: totalAiRequests || 0,
      messagesToday: messagesToday || 0,
      dailyChart,
    });
  } catch (err) {
    console.error("[admin.getStats] Error:", err?.message);
    return res.status(500).json({ error: "Failed to fetch stats." });
  }
}

/**
 * GET /api/admin/users
 * Returns all users with conversation and message counts.
 */
export async function getUsers(req, res) {
  try {
    // Get all users
    const { data: users, error: usersErr } = await supabaseAdmin
      .from("users")
      .select("id, username, email, role, created_at")
      .order("created_at", { ascending: false });

    if (usersErr) throw usersErr;

    // Get conversation counts per user
    const { data: convCounts, error: convErr } = await supabaseAdmin
      .from("conversations")
      .select("user_id");

    if (convErr) throw convErr;

    // Get message counts per user
    const { data: msgCounts, error: msgErr } = await supabaseAdmin
      .from("messages")
      .select("user_id");

    if (msgErr) throw msgErr;

    // Aggregate counts
    const convCountMap = {};
    for (const c of convCounts || []) {
      convCountMap[c.user_id] = (convCountMap[c.user_id] || 0) + 1;
    }

    const msgCountMap = {};
    for (const m of msgCounts || []) {
      msgCountMap[m.user_id] = (msgCountMap[m.user_id] || 0) + 1;
    }

    const enrichedUsers = (users || []).map((u) => ({
      ...u,
      conversationCount: convCountMap[u.id] || 0,
      messageCount: msgCountMap[u.id] || 0,
    }));

    return res.json({ users: enrichedUsers });
  } catch (err) {
    console.error("[admin.getUsers] Error:", err?.message);
    return res.status(500).json({ error: "Failed to fetch users." });
  }
}

/**
 * GET /api/admin/conversations?page=1&limit=20
 * Returns paginated conversations with user info and message counts.
 */
export async function getConversations(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    // Total count
    const { count: totalCount, error: countErr } = await supabaseAdmin
      .from("conversations")
      .select("id", { count: "exact", head: true });

    if (countErr) throw countErr;

    // Get conversations with user info
    const { data: conversations, error: convsErr } = await supabaseAdmin
      .from("conversations")
      .select("id, user_id, title, created_at, updated_at, users(username, email)")
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (convsErr) throw convsErr;

    // Get message counts for these conversations
    const convIds = (conversations || []).map((c) => c.id);

    let msgCountMap = {};
    if (convIds.length > 0) {
      const { data: msgData, error: msgErr } = await supabaseAdmin
        .from("messages")
        .select("conversation_id")
        .in("conversation_id", convIds);

      if (msgErr) throw msgErr;

      for (const m of msgData || []) {
        msgCountMap[m.conversation_id] = (msgCountMap[m.conversation_id] || 0) + 1;
      }
    }

    const enriched = (conversations || []).map((c) => ({
      id: c.id,
      userId: c.user_id,
      title: c.title,
      username: c.users?.username || "Unknown",
      email: c.users?.email || "",
      messageCount: msgCountMap[c.id] || 0,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));

    return res.json({
      conversations: enriched,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
    });
  } catch (err) {
    console.error("[admin.getConversations] Error:", err?.message);
    return res.status(500).json({ error: "Failed to fetch conversations." });
  }
}

/**
 * GET /api/admin/conversations/:id/messages
 * Returns all messages for a specific conversation.
 */
export async function getConversationMessages(req, res) {
  try {
    const { id } = req.params;

    // First get the conversation info
    const { data: conv, error: convErr } = await supabaseAdmin
      .from("conversations")
      .select("id, title, user_id, created_at, users(username, email)")
      .eq("id", id)
      .single();

    if (convErr || !conv) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    // Get all messages
    const { data: messages, error: msgsErr } = await supabaseAdmin
      .from("messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (msgsErr) throw msgsErr;

    return res.json({
      conversation: {
        id: conv.id,
        title: conv.title,
        username: conv.users?.username || "Unknown",
        email: conv.users?.email || "",
        createdAt: conv.created_at,
      },
      messages: messages || [],
    });
  } catch (err) {
    console.error("[admin.getConversationMessages] Error:", err?.message);
    return res.status(500).json({ error: "Failed to fetch messages." });
  }
}

/**
 * GET /api/admin/ai-usage
 * Returns AI usage statistics.
 */
export async function getAIUsage(req, res) {
  try {
    const now = new Date();

    // Today start
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Week start (Monday)
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (weekStart.getDay() === 0 ? -6 : 1));
    weekStart.setHours(0, 0, 0, 0);

    // Total AI responses
    const { count: totalAiResponses, error: totalErr } = await supabaseAdmin
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("role", "assistant");

    if (totalErr) throw totalErr;

    // Total user messages
    const { count: totalUserMessages, error: userMsgErr } = await supabaseAdmin
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("role", "user");

    if (userMsgErr) throw userMsgErr;

    // AI responses today
    const { count: aiToday, error: todayErr } = await supabaseAdmin
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("role", "assistant")
      .gte("created_at", todayStart.toISOString());

    if (todayErr) throw todayErr;

    // AI responses this week
    const { count: aiThisWeek, error: weekErr } = await supabaseAdmin
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("role", "assistant")
      .gte("created_at", weekStart.toISOString());

    if (weekErr) throw weekErr;

    // Daily breakdown for last 7 days (for chart)
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data: recentAi, error: recentErr } = await supabaseAdmin
      .from("messages")
      .select("created_at")
      .eq("role", "assistant")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    if (recentErr) throw recentErr;

    const { data: recentUser, error: recentUserErr } = await supabaseAdmin
      .from("messages")
      .select("created_at")
      .eq("role", "user")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    if (recentUserErr) throw recentUserErr;

    // Build daily chart data
    const dailyData = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split("T")[0];
      dailyData[key] = { aiResponses: 0, userMessages: 0 };
    }

    for (const msg of recentAi || []) {
      const key = new Date(msg.created_at).toISOString().split("T")[0];
      if (dailyData[key]) dailyData[key].aiResponses++;
    }

    for (const msg of recentUser || []) {
      const key = new Date(msg.created_at).toISOString().split("T")[0];
      if (dailyData[key]) dailyData[key].userMessages++;
    }

    const dailyChart = Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data,
    }));

    return res.json({
      totalAiResponses: totalAiResponses || 0,
      totalUserMessages: totalUserMessages || 0,
      aiToday: aiToday || 0,
      aiThisWeek: aiThisWeek || 0,
      dailyChart,
    });
  } catch (err) {
    console.error("[admin.getAIUsage] Error:", err?.message);
    return res.status(500).json({ error: "Failed to fetch AI usage." });
  }
}
