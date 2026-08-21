import { getAdminClient } from "../services/supabase.service.js";

/**
 * GET /api/admin/stats
 * Returns dashboard overview stats, active users, recent items, and 7-day daily activity chart.
 */
export async function getStats(req, res) {
  try {
    const db = getAdminClient(req);

    // 1. Total users count
    const { count: totalUsers, error: usersErr } = await db
      .from("users")
      .select("id", { count: "exact", head: true });

    if (usersErr) throw usersErr;

    // 2. Total conversations count
    const { count: totalConversations, error: convsErr } = await db
      .from("conversations")
      .select("id", { count: "exact", head: true });

    if (convsErr) throw convsErr;

    // 3. Total messages count
    const { count: totalMessages, error: msgsErr } = await db
      .from("messages")
      .select("id", { count: "exact", head: true });

    if (msgsErr) throw msgsErr;

    // 4. Total AI requests (assistant messages)
    const { count: totalAiRequests, error: aiErr } = await db
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("role", "assistant");

    if (aiErr) throw aiErr;

    // 5. Messages today (since midnight UTC)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count: messagesToday, error: todayErr } = await db
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("role", "assistant")
      .gte("created_at", todayStart.toISOString());

    if (todayErr) throw todayErr;

    // 6. Active users in the last 7 days (distinct users with messages)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data: activeUserData, error: activeUserErr } = await db
      .from("messages")
      .select("user_id")
      .gte("created_at", sevenDaysAgo.toISOString());

    if (activeUserErr) throw activeUserErr;

    const activeUserSet = new Set(
      (activeUserData || []).map((m) => m.user_id).filter(Boolean)
    );
    const activeUsersCount = activeUserSet.size;

    // 7. Daily message counts for last 7 days (AI and User)
    const { data: recentAiMessages, error: recentAiErr } = await db
      .from("messages")
      .select("created_at, role")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    if (recentAiErr) throw recentAiErr;

    const dailyCounts = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split("T")[0];
      dailyCounts[key] = { count: 0, userCount: 0, aiCount: 0 };
    }

    for (const msg of recentAiMessages || []) {
      const key = new Date(msg.created_at).toISOString().split("T")[0];
      if (dailyCounts[key]) {
        if (msg.role === "assistant") {
          dailyCounts[key].count++;
          dailyCounts[key].aiCount++;
        } else {
          dailyCounts[key].userCount++;
        }
      }
    }

    const dailyChart = Object.entries(dailyCounts).map(([date, data]) => ({
      date,
      count: data.count,
      userCount: data.userCount,
      aiCount: data.aiCount,
    }));

    // 8. Recent 5 Conversations (resilient lookup without PostgREST join dependency)
    const { data: recentConvs, error: recentConvsErr } = await db
      .from("conversations")
      .select("id, title, user_id, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(5);

    if (recentConvsErr) throw recentConvsErr;

    // Fetch user details in batch
    const recentUserIds = [
      ...new Set((recentConvs || []).map((c) => c.user_id).filter(Boolean)),
    ];
    let userMap = {};
    if (recentUserIds.length > 0) {
      const { data: usersData } = await db
        .from("users")
        .select("id, username, email")
        .in("id", recentUserIds);

      for (const u of usersData || []) {
        userMap[u.id] = u;
      }
    }

    // Get message counts for recent 5 conversations
    const recentConvIds = (recentConvs || []).map((c) => c.id);
    let convMsgCounts = {};
    if (recentConvIds.length > 0) {
      const { data: rMsgData } = await db
        .from("messages")
        .select("conversation_id")
        .in("conversation_id", recentConvIds);

      for (const m of rMsgData || []) {
        convMsgCounts[m.conversation_id] = (convMsgCounts[m.conversation_id] || 0) + 1;
      }
    }

    const recentConversations = (recentConvs || []).map((c) => {
      const user = userMap[c.user_id];
      return {
        id: c.id,
        userId: c.user_id,
        title: c.title || "Untitled",
        username: user?.username || "Unknown",
        email: user?.email || "",
        messageCount: convMsgCounts[c.id] || 0,
        updatedAt: c.updated_at,
        createdAt: c.created_at,
      };
    });

    // 9. Recent 5 User Signups
    const { data: recentUsers, error: recentUsersErr } = await db
      .from("users")
      .select("id, username, email, role, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentUsersErr) throw recentUsersErr;

    const avgMessages =
      totalConversations && totalConversations > 0
        ? Math.round(((totalMessages || 0) / totalConversations) * 10) / 10
        : 0;

    return res.json({
      totalUsers: totalUsers || 0,
      totalConversations: totalConversations || 0,
      totalMessages: totalMessages || 0,
      totalAiRequests: totalAiRequests || 0,
      messagesToday: messagesToday || 0,
      activeUsersCount,
      avgMessagesPerConversation: avgMessages,
      dailyChart,
      recentConversations,
      recentUsers: recentUsers || [],
    });
  } catch (err) {
    console.error("[admin.getStats] Error:", err?.message);
    return res.status(500).json({ error: "Failed to fetch stats." });
  }
}

/**
 * GET /api/admin/users
 * Returns all users with conversation count, message count, and last active timestamp.
 */
export async function getUsers(req, res) {
  try {
    const db = getAdminClient(req);

    // 1. Get all users
    const { data: users, error: usersErr } = await db
      .from("users")
      .select("id, username, email, role, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (usersErr) throw usersErr;

    // 2. Get conversation counts per user
    const { data: convCounts, error: convErr } = await db
      .from("conversations")
      .select("user_id, updated_at");

    if (convErr) throw convErr;

    // 3. Get message counts and latest message timestamp per user
    const { data: msgCounts, error: msgErr } = await db
      .from("messages")
      .select("user_id, created_at");

    if (msgErr) throw msgErr;

    // Map conversation counts and last updated conv
    const convCountMap = {};
    const lastActiveMap = {};

    for (const c of convCounts || []) {
      if (c.user_id) {
        convCountMap[c.user_id] = (convCountMap[c.user_id] || 0) + 1;
        if (
          !lastActiveMap[c.user_id] ||
          new Date(c.updated_at) > new Date(lastActiveMap[c.user_id])
        ) {
          lastActiveMap[c.user_id] = c.updated_at;
        }
      }
    }

    // Map message counts and last message timestamp
    const msgCountMap = {};
    for (const m of msgCounts || []) {
      if (m.user_id) {
        msgCountMap[m.user_id] = (msgCountMap[m.user_id] || 0) + 1;
        if (
          !lastActiveMap[m.user_id] ||
          new Date(m.created_at) > new Date(lastActiveMap[m.user_id])
        ) {
          lastActiveMap[m.user_id] = m.created_at;
        }
      }
    }

    const enrichedUsers = (users || []).map((u) => ({
      ...u,
      conversationCount: convCountMap[u.id] || 0,
      messageCount: msgCountMap[u.id] || 0,
      lastActiveAt: lastActiveMap[u.id] || u.created_at,
    }));

    return res.json({ users: enrichedUsers });
  } catch (err) {
    console.error("[admin.getUsers] Error:", err?.message);
    return res.status(500).json({ error: "Failed to fetch users." });
  }
}

/**
 * PUT /api/admin/users/:id/role
 * Updates a user's role ('admin' | 'user').
 * Body: { role: "admin" | "user" }
 */
export async function updateUserRole(req, res) {
  try {
    const db = getAdminClient(req);
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Role must be 'user' or 'admin'." });
    }

    // Prevent admin from demoting themselves
    if (req.user.id === id && role !== "admin") {
      return res
        .status(400)
        .json({ error: "You cannot revoke your own admin role." });
    }

    const { data: updatedUser, error: updateErr } = await db
      .from("users")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, username, email, role, updated_at")
      .single();

    if (updateErr) throw updateErr;

    return res.json({
      message: `User role updated to ${role}.`,
      user: updatedUser,
    });
  } catch (err) {
    console.error("[admin.updateUserRole] Error:", err?.message);
    return res.status(500).json({ error: "Failed to update user role." });
  }
}

/**
 * DELETE /api/admin/users/:id
 * Deletes a user and cascades all related data.
 */
export async function deleteUser(req, res) {
  try {
    const db = getAdminClient(req);
    const { id } = req.params;

    if (req.user.id === id) {
      return res
        .status(400)
        .json({ error: "You cannot delete your own account from admin panel." });
    }

    // 1. Delete from Supabase Auth admin API if accessible
    try {
      await db.auth.admin.deleteUser(id);
    } catch {
      // Fallback
    }

    // 2. Delete from public.users (cascades conversations and messages via foreign key)
    const { error: dbDeleteErr } = await db
      .from("users")
      .delete()
      .eq("id", id);

    if (dbDeleteErr) throw dbDeleteErr;

    return res.json({ message: "User deleted successfully." });
  } catch (err) {
    console.error("[admin.deleteUser] Error:", err?.message);
    return res.status(500).json({ error: "Failed to delete user." });
  }
}

/**
 * GET /api/admin/conversations?page=1&limit=20&search=...&userId=...
 * Returns paginated conversations with user info and message counts.
 */
export async function getConversations(req, res) {
  try {
    const db = getAdminClient(req);
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const search = req.query.search?.trim();
    const userId = req.query.userId?.trim();

    let query = db
      .from("conversations")
      .select("id, user_id, title, created_at, updated_at", {
        count: "exact",
      });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    const {
      data: conversations,
      count: totalCount,
      error: convsErr,
    } = await query
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (convsErr) throw convsErr;

    // Resiliently fetch user info in batch
    const userIds = [
      ...new Set((conversations || []).map((c) => c.user_id).filter(Boolean)),
    ];
    let userMap = {};
    if (userIds.length > 0) {
      const { data: usersData } = await db
        .from("users")
        .select("id, username, email")
        .in("id", userIds);

      for (const u of usersData || []) {
        userMap[u.id] = u;
      }
    }

    // Get message counts for these conversations
    const convIds = (conversations || []).map((c) => c.id);

    let msgCountMap = {};
    if (convIds.length > 0) {
      const { data: msgData, error: msgErr } = await db
        .from("messages")
        .select("conversation_id")
        .in("conversation_id", convIds);

      if (msgErr) throw msgErr;

      for (const m of msgData || []) {
        msgCountMap[m.conversation_id] = (msgCountMap[m.conversation_id] || 0) + 1;
      }
    }

    const enriched = (conversations || []).map((c) => {
      const user = userMap[c.user_id];
      return {
        id: c.id,
        userId: c.user_id,
        title: c.title || "Untitled",
        username: user?.username || "Unknown",
        email: user?.email || "",
        messageCount: msgCountMap[c.id] || 0,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      };
    });

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
 * Returns all messages for a specific conversation with conversation info.
 */
export async function getConversationMessages(req, res) {
  try {
    const db = getAdminClient(req);
    const { id } = req.params;

    // Get the conversation info
    const { data: conv, error: convErr } = await db
      .from("conversations")
      .select("id, title, user_id, created_at, updated_at")
      .eq("id", id)
      .single();

    if (convErr || !conv) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    // Get user info
    let userInfo = { username: "Unknown", email: "" };
    if (conv.user_id) {
      const { data: user } = await db
        .from("users")
        .select("username, email")
        .eq("id", conv.user_id)
        .single();

      if (user) {
        userInfo = user;
      }
    }

    // Get all messages
    const { data: messages, error: msgsErr } = await db
      .from("messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (msgsErr) throw msgsErr;

    return res.json({
      conversation: {
        id: conv.id,
        title: conv.title || "Untitled",
        username: userInfo.username || "Unknown",
        email: userInfo.email || "",
        userId: conv.user_id,
        createdAt: conv.created_at,
        updatedAt: conv.updated_at,
      },
      messages: messages || [],
    });
  } catch (err) {
    console.error("[admin.getConversationMessages] Error:", err?.message);
    return res.status(500).json({ error: "Failed to fetch messages." });
  }
}

/**
 * DELETE /api/admin/conversations/:id
 * Deletes a conversation and its messages.
 */
export async function deleteConversation(req, res) {
  try {
    const db = getAdminClient(req);
    const { id } = req.params;

    const { error } = await db
      .from("conversations")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return res.json({ message: "Conversation deleted successfully." });
  } catch (err) {
    console.error("[admin.deleteConversation] Error:", err?.message);
    return res.status(500).json({ error: "Failed to delete conversation." });
  }
}

/**
 * GET /api/admin/ai-usage?days=7|14|30
 * Returns AI usage statistics, breakdown by day, and top active users.
 */
export async function getAIUsage(req, res) {
  try {
    const db = getAdminClient(req);
    const days = Math.min(90, Math.max(1, parseInt(req.query.days) || 7));
    const now = new Date();

    // Today start (midnight)
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Week start (Monday)
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (weekStart.getDay() === 0 ? -6 : 1));
    weekStart.setHours(0, 0, 0, 0);

    // Total AI responses
    const { count: totalAiResponses, error: totalErr } = await db
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("role", "assistant");

    if (totalErr) throw totalErr;

    // Total user messages
    const { count: totalUserMessages, error: userMsgErr } = await db
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("role", "user");

    if (userMsgErr) throw userMsgErr;

    // AI responses today
    const { count: aiToday, error: todayErr } = await db
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("role", "assistant")
      .gte("created_at", todayStart.toISOString());

    if (todayErr) throw todayErr;

    // AI responses this week
    const { count: aiThisWeek, error: weekErr } = await db
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("role", "assistant")
      .gte("created_at", weekStart.toISOString());

    if (weekErr) throw weekErr;

    // Daily breakdown for last N days (for chart)
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const { data: messagesInRange, error: rangeErr } = await db
      .from("messages")
      .select("created_at, role, user_id")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (rangeErr) throw rangeErr;

    // Build daily chart data
    const dailyData = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split("T")[0];
      dailyData[key] = { aiResponses: 0, userMessages: 0, total: 0 };
    }

    const userActivityMap = {};

    for (const msg of messagesInRange || []) {
      const key = new Date(msg.created_at).toISOString().split("T")[0];
      if (dailyData[key]) {
        if (msg.role === "assistant") {
          dailyData[key].aiResponses++;
        } else {
          dailyData[key].userMessages++;
        }
        dailyData[key].total++;
      }

      if (msg.user_id) {
        userActivityMap[msg.user_id] = (userActivityMap[msg.user_id] || 0) + 1;
      }
    }

    const dailyChart = Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data,
    }));

    // Top active users
    const topUserIds = Object.entries(userActivityMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    let topUsers = [];
    if (topUserIds.length > 0) {
      const { data: userProfiles } = await db
        .from("users")
        .select("id, username, email, role")
        .in("id", topUserIds);

      topUsers = (userProfiles || []).map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        messageCount: userActivityMap[u.id] || 0,
      })).sort((a, b) => b.messageCount - a.messageCount);
    }

    return res.json({
      totalAiResponses: totalAiResponses || 0,
      totalUserMessages: totalUserMessages || 0,
      aiToday: aiToday || 0,
      aiThisWeek: aiThisWeek || 0,
      days,
      topUsers,
      dailyChart,
    });
  } catch (err) {
    console.error("[admin.getAIUsage] Error:", err?.message);
    return res.status(500).json({ error: "Failed to fetch AI usage." });
  }
}
