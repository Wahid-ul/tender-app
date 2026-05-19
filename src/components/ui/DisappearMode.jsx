import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDisappear } from "../../hooks/useDisappear";

export const DISAPPEAR_OPTIONS = [
  {
    id:    "overwhelmed",
    label: "alive but overwhelmed",
    emoji: "🌊",
    desc:  "too much happening. still here.",
    color: "#dbeafe",
  },
  {
    id:    "silence",
    label: "need silence",
    emoji: "🔇",
    desc:  "not ignoring you. just quiet.",
    color: "#ede8fd",
  },
  {
    id:    "recharge",
    label: "recharge week",
    emoji: "🔋",
    desc:  "logging off. back soon.",
    color: "#d8f0e0",
  },
  {
    id:    "backsoon",
    label: "back soon",
    emoji: "🌙",
    desc:  "stepping away for a bit.",
    color: "#fde8f0",
  },
];

const DURATIONS = [
  { label: "Today",   hours: 24  },
  { label: "3 days",  hours: 72  },
  { label: "1 week",  hours: 168 },
];

export default function DisappearMode({ user, inviteCode, onClose }) {
  const { myStatus, setDisappear, clearDisappear } = useDisappear(user?.id, inviteCode);

  const [selected, setSelected]   = useState(null);
  const [duration, setDuration]   = useState(DURATIONS[0]);
  const [saving,   setSaving]     = useState(false);
  const [done,     setDone]       = useState(false);

  const handleSet = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await setDisappear(selected.id, duration.hours);
      setDone(true);
      setTimeout(onClose, 1800);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    await clearDisappear();
    setSaving(false);
    onClose();
  };

  if (done) {
    return (
      <motion.div
        className="flex flex-col items-center gap-3 py-6 text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1,   opacity: 1 }}
      >
        <span className="text-5xl">{selected?.emoji}</span>
        <p className="font-hand text-2xl text-ink font-bold">set.</p>
        <p className="text-sm text-muted">your circle will see this instead of silence.</p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Active status banner */}
      <AnimatePresence>
        {myStatus && (
          <motion.div
            className="flex items-center justify-between p-3 rounded-xl"
            style={{ background: DISAPPEAR_OPTIONS.find((o) => o.id === myStatus.status)?.color ?? "var(--cream)" }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{DISAPPEAR_OPTIONS.find((o) => o.id === myStatus.status)?.emoji}</span>
              <div>
                <p className="text-xs font-semibold text-ink">currently active</p>
                <p className="text-xs text-muted">
                  {DISAPPEAR_OPTIONS.find((o) => o.id === myStatus.status)?.label}
                </p>
              </div>
            </div>
            <button
              onClick={handleClear}
              disabled={saving}
              className="text-xs text-muted border-none bg-transparent cursor-pointer font-medium"
            >
              clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status options */}
      <div>
        <p className="text-xs text-muted font-medium mb-2">set your quiet status</p>
        <div className="flex flex-col gap-2">
          {DISAPPEAR_OPTIONS.map((opt, i) => (
            <motion.button
              key={opt.id}
              className="flex items-center gap-3 p-3 rounded-xl text-left w-full border-none cursor-pointer transition-all"
              style={{
                background:  selected?.id === opt.id ? opt.color : "var(--cream)",
                outline:     selected?.id === opt.id ? "2px solid rgba(0,0,0,0.15)" : "none",
              }}
              onClick={() => setSelected(opt)}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1,  x: 0   }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
              <div className="flex-1">
                <p className="font-hand text-lg text-ink font-semibold leading-tight">{opt.label}</p>
                <p className="text-xs text-muted mt-0.5">{opt.desc}</p>
              </div>
              {selected?.id === opt.id && (
                <motion.span
                  className="text-ink font-bold text-sm"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  ✓
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Duration picker */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-xs text-muted font-medium mb-2">for how long?</p>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.label}
                  onClick={() => setDuration(d)}
                  className="flex-1 py-2 rounded-xl text-sm font-medium border-none cursor-pointer transition-all"
                  style={{
                    background: duration.label === d.label ? "var(--ink)" : "var(--cream)",
                    color:      duration.label === d.label ? "#fff"       : "var(--muted)",
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="tender-btn tender-btn-primary"
        onClick={handleSet}
        disabled={!selected || saving}
        style={{ opacity: !selected ? 0.4 : 1 }}
        whileTap={{ scale: 0.97 }}
      >
        {saving ? "Setting..." : "Go quiet 🌙"}
      </motion.button>

      <p className="text-xs text-muted text-center">
        your circle sees this instead of wondering where you went.
      </p>
    </div>
  );
}
