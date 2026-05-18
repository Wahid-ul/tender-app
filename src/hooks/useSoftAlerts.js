import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const DECLINE_MOODS = ["numb", "surviving", "feral"];
const SILENT_DAYS   = 7;

export function useSoftAlerts(circleId, currentUserId) {
  const [alerts,    setAlerts]    = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tender_dismissed_alerts") ?? "[]");
    } catch { return []; }
  });

  useEffect(() => {
    if (!circleId || !currentUserId) return;
    detectAlerts();
  }, [circleId, currentUserId]);

  const detectAlerts = async () => {
    // 1. Get all members except current user
    const { data: memberData } = await supabase
      .from("circle_members")
      .select("profile:profiles(id, name)")
      .eq("circle_id", circleId)
      .neq("user_id", currentUserId);

    if (!memberData?.length) return;
    const members = memberData.map((m) => m.profile);
    const ids     = members.map((m) => m.id);

    // 2. Get each member's last post date
    const { data: lastPosts } = await supabase
      .from("posts")
      .select("user_id, created_at")
      .in("user_id", ids)
      .eq("circle_id", circleId)
      .order("created_at", { ascending: false });

    // 3. Get last 4 moods per member
    const sevenDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const { data: recentMoods } = await supabase
      .from("moods")
      .select("user_id, mood, date")
      .in("user_id", ids)
      .gte("date", sevenDaysAgo)
      .order("date", { ascending: false });

    // 4. Get active disappear statuses (skip alerts for these people)
    const { data: disappearing } = await supabase
      .from("disappear_status")
      .select("user_id")
      .in("user_id", ids)
      .gt("expires_at", new Date().toISOString());

    const quietIds = new Set((disappearing ?? []).map((d) => d.user_id));

    // 5. Build a last-post map
    const lastPostMap = {};
    (lastPosts ?? []).forEach((p) => {
      if (!lastPostMap[p.user_id]) lastPostMap[p.user_id] = p.created_at;
    });

    // 6. Build mood history map
    const moodHistoryMap = {};
    (recentMoods ?? []).forEach((m) => {
      if (!moodHistoryMap[m.user_id]) moodHistoryMap[m.user_id] = [];
      moodHistoryMap[m.user_id].push(m.mood);
    });

    const now      = Date.now();
    const detected = [];

    members.forEach((member) => {
      // Skip people in disappear mode — they told us they need quiet
      if (quietIds.has(member.id)) return;

      const alertKey_silent  = `silent-${member.id}`;
      const alertKey_decline = `decline-${member.id}`;

      // ── Check: silent for 7+ days ─────────────────
      const lastPost = lastPostMap[member.id];
      const daysSince = lastPost
        ? (now - new Date(lastPost).getTime()) / (1000 * 60 * 60 * 24)
        : Infinity;

      if (daysSince >= SILENT_DAYS && !dismissed.includes(alertKey_silent)) {
        detected.push({
          id:     alertKey_silent,
          type:   "silent",
          member,
          days:   Math.floor(daysSince === Infinity ? null : daysSince),
          neverPosted: !lastPost,
        });
      }

      // ── Check: mood declining (3+ days of low moods) ──
      const moods = moodHistoryMap[member.id] ?? [];
      const last3 = moods.slice(0, 3);
      const allLow = last3.length >= 3 && last3.every((m) => DECLINE_MOODS.includes(m));

      if (allLow && !dismissed.includes(alertKey_decline)) {
        detected.push({
          id:     alertKey_decline,
          type:   "declining",
          member,
          moods:  last3,
        });
      }
    });

    setAlerts(detected);
  };

  const dismiss = (alertId) => {
    const next = [...dismissed, alertId];
    setDismissed(next);
    localStorage.setItem("tender_dismissed_alerts", JSON.stringify(next));
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  return { alerts, dismiss };
}
