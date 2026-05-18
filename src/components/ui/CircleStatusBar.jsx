import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { DISAPPEAR_OPTIONS } from "./DisappearMode";

const MOOD_EMOJIS = {
  surviving: "😮‍💨", thriving: "🌱", feral: "🐺",
  numb: "🌫️", productive: "⚡", romanticizing: "🎞️",
};

const MOOD_COLORS = {
  surviving: "#fde8d8", thriving: "#d8f0e0", feral: "#ede8fd",
  numb: "#e8e8e8", productive: "#d8eafd", romanticizing: "#fde8f0",
};

export default function CircleStatusBar({ circle, currentUserId }) {
  const [members,   setMembers]   = useState([]);
  const [tooltip,   setTooltip]   = useState(null); // user_id of tapped member
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!circle?.id) return;
    fetchStatuses();
  }, [circle?.id]);

  const fetchStatuses = async () => {
    // Get all members with their profile
    const { data: memberData } = await supabase
      .from("circle_members")
      .select("profile:profiles(id, name)")
      .eq("circle_id", circle.id);

    if (!memberData) return;
    const profiles = memberData.map((m) => m.profile);

    // Get today's moods
    const ids = profiles.map((p) => p.id);
    const { data: moodData } = await supabase
      .from("moods")
      .select("user_id, mood")
      .in("user_id", ids)
      .eq("date", today);

    // Get active disappear statuses
    const { data: disappearData } = await supabase
      .from("disappear_status")
      .select("user_id, status")
      .in("user_id", ids)
      .gt("expires_at", new Date().toISOString());

    const moodMap     = Object.fromEntries((moodData     ?? []).map((m) => [m.user_id, m.mood]));
    const disappearMap = Object.fromEntries((disappearData ?? []).map((d) => [d.user_id, d.status]));

    setMembers(
      profiles.map((p) => ({
        ...p,
        mood:     moodMap[p.id]      ?? null,
        disappear: disappearMap[p.id] ?? null,
      }))
    );
  };

  if (!members.length) return null;

  return (
    <div className="px-4 mb-4">
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {members.map((member, i) => {
          const isMe      = member.id === currentUserId;
          const disappear = DISAPPEAR_OPTIONS.find((o) => o.id === member.disappear);
          const moodColor = member.mood ? MOOD_COLORS[member.mood] : "var(--cream)";
          const statusEmoji = disappear
            ? disappear.emoji
            : member.mood
            ? MOOD_EMOJIS[member.mood]
            : "🤍";

          return (
            <motion.div
              key={member.id}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1,  y: 0  }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setTooltip(tooltip === member.id ? null : member.id)}
            >
              {/* Avatar bubble */}
              <div className="relative">
                <motion.div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold"
                  style={{
                    background:  moodColor,
                    border:      isMe ? "2.5px solid var(--ink)" : "2px solid rgba(0,0,0,0.08)",
                    opacity:     member.disappear ? 0.65 : 1,
                  }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                >
                  {member.name?.[0]?.toUpperCase() ?? "?"}
                </motion.div>

                {/* Status emoji badge */}
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  style={{ background: "#fff", border: "1.5px solid rgba(0,0,0,0.08)" }}
                >
                  {statusEmoji}
                </div>
              </div>

              {/* Name */}
              <p className="text-xs text-muted font-medium max-w-[48px] truncate text-center">
                {isMe ? "you" : member.name?.split(" ")[0]}
              </p>

              {/* Tooltip on tap */}
              <AnimatePresence>
                {tooltip === member.id && (
                  <motion.div
                    className="absolute z-50 mt-14 bg-white rounded-xl px-3 py-2 shadow-polaroid text-center pointer-events-none"
                    style={{ border: "1px solid rgba(0,0,0,0.08)", minWidth: 120 }}
                    initial={{ opacity: 0, y: -6, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0,  scale: 1    }}
                    exit={{   opacity: 0, y: -6, scale: 0.92 }}
                  >
                    <p className="font-semibold text-ink text-sm">{member.name}</p>
                    {disappear && (
                      <p className="text-xs text-muted mt-0.5">{disappear.emoji} {disappear.label}</p>
                    )}
                    {!disappear && member.mood && (
                      <p className="text-xs text-muted mt-0.5">{MOOD_EMOJIS[member.mood]} {member.mood}</p>
                    )}
                    {!disappear && !member.mood && (
                      <p className="text-xs text-muted mt-0.5">no mood set yet</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
