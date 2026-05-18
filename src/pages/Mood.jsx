import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

const MOODS = [
  { id: "surviving",     label: "surviving",     emoji: "😮‍💨", color: "#fde8d8" },
  { id: "thriving",      label: "thriving",      emoji: "🌱",  color: "#d8f0e0" },
  { id: "feral",         label: "feral",         emoji: "🐺",  color: "#ede8fd" },
  { id: "numb",          label: "numb",          emoji: "🌫️", color: "#e8e8e8" },
  { id: "productive",    label: "productive",    emoji: "⚡",  color: "#d8eafd" },
  { id: "romanticizing", label: "romanticizing", emoji: "🎞️", color: "#fde8f0" },
];

export default function Mood({ user, circle }) {
  const [todayMoods, setTodayMoods] = useState([]);
  const [myMood,     setMyMood]     = useState(null);
  const [saving,     setSaving]     = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!circle?.id) return;
    fetchMoods();
  }, [circle?.id]);

  const fetchMoods = async () => {
    const { data } = await supabase
      .from("moods")
      .select("*, profile:profiles(name)")
      .eq("circle_id", circle.id)
      .eq("date", today);

    if (data) {
      setTodayMoods(data);
      const mine = data.find((m) => m.user_id === user.id);
      if (mine) setMyMood(mine.mood);
    }
  };

  const selectMood = async (moodId) => {
    setSaving(true);
    const { error } = await supabase
      .from("moods")
      .upsert(
        { user_id: user.id, circle_id: circle.id, mood: moodId, date: today },
        { onConflict: "user_id,circle_id,date" }
      );
    if (!error) {
      setMyMood(moodId);
      await fetchMoods();
    }
    setSaving(false);
  };

  const otherMoods = todayMoods.filter((m) => m.user_id !== user.id);

  return (
    <div className="px-4 pt-4">
      <div className="mb-6">
        <h1 className="font-hand text-3xl text-ink font-bold">mood ring</h1>
        <p className="text-muted text-sm mt-1">
          {myMood ? `you're feeling ${myMood} today` : "how are you really feeling?"}
        </p>
      </div>

      {/* Friend moods */}
      {otherMoods.length > 0 && (
        <motion.div
          className="paper-card p-4 mb-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs text-muted font-medium mb-3">your circle today</p>
          <div className="flex flex-col gap-2">
            {otherMoods.map((m) => {
              const moodDef = MOODS.find((md) => md.id === m.mood);
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: "var(--blush)" }}
                  >
                    {m.profile?.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <span className="text-sm text-ink font-medium">{m.profile?.name}</span>
                  <span className="ml-auto text-xl">{moodDef?.emoji}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: moodDef?.color, color: "var(--ink)" }}
                  >
                    {m.mood}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Mood grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {MOODS.map((mood, i) => (
          <motion.button
            key={mood.id}
            className="flex flex-col items-center gap-2 p-5 rounded-2xl cursor-pointer border-none"
            style={{
              background: mood.color,
              outline: myMood === mood.id ? "2.5px solid rgba(0,0,0,0.22)" : "none",
              opacity: saving ? 0.7 : 1,
            }}
            onClick={() => !saving && selectMood(mood.id)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <span className="text-3xl">{mood.emoji}</span>
            <span className="font-hand text-lg text-ink font-semibold">{mood.label}</span>
            {myMood === mood.id && (
              <span className="text-xs text-ink opacity-60 font-medium">← you</span>
            )}
          </motion.button>
        ))}
      </div>

      <p className="font-hand text-center text-muted text-lg">
        your circle will know. 🤍
      </p>
    </div>
  );
}
