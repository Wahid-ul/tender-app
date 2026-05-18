import { motion, AnimatePresence } from "framer-motion";

const MOOD_EMOJIS = {
  surviving: "😮‍💨", thriving: "🌱", feral: "🐺",
  numb: "🌫️", productive: "⚡", romanticizing: "🎞️",
};

function AlertContent({ alert }) {
  const { member } = alert;
  const initial = member.name?.[0]?.toUpperCase() ?? "?";

  if (alert.type === "silent") {
    return (
      <>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
            style={{ background: "var(--blush)" }}
          >
            {initial}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{member.name}</p>
            <p className="text-xs text-muted">
              {alert.neverPosted
                ? "hasn't posted yet — might need a nudge"
                : `quiet for ${alert.days} day${alert.days !== 1 ? "s" : ""}`}
            </p>
          </div>
          <span className="ml-auto text-2xl">🤫</span>
        </div>
        <p className="font-hand text-lg text-ink mt-2">
          check on {member.name?.split(" ")[0]}?
        </p>
      </>
    );
  }

  if (alert.type === "declining") {
    const moodLine = alert.moods
      .map((m) => MOOD_EMOJIS[m] ?? "•")
      .join(" → ");
    return (
      <>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
            style={{ background: "#fde8d8" }}
          >
            {initial}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{member.name}</p>
            <p className="text-xs text-muted">mood: {moodLine}</p>
          </div>
          <span className="ml-auto text-2xl">💛</span>
        </div>
        <p className="font-hand text-lg text-ink mt-2">
          {member.name?.split(" ")[0]} has been low lately.
        </p>
      </>
    );
  }
  return null;
}

export default function SoftAlertCard({ alert, onDismiss }) {
  const bgColor = alert.type === "declining" ? "#fef9ec" : "#f0f4ff";

  return (
    <motion.div
      layout
      className="mx-4 rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: bgColor, border: "1px solid rgba(0,0,0,0.07)" }}
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,   scale: 1    }}
      exit={{   opacity: 0, y: -12, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
    >
      <AlertContent alert={alert} />

      {/* Actions */}
      <div className="flex gap-2 mt-1">
        <motion.button
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer"
          style={{ background: "var(--ink)", color: "#fff" }}
          whileHover={{ opacity: 0.88 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onDismiss(alert.id)}
        >
          Send a 🤍
        </motion.button>
        <motion.button
          className="px-4 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer"
          style={{ background: "rgba(0,0,0,0.06)", color: "var(--muted)" }}
          whileHover={{ background: "rgba(0,0,0,0.1)" }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onDismiss(alert.id)}
        >
          not now
        </motion.button>
      </div>

      <p className="text-xs text-center" style={{ color: "rgba(0,0,0,0.3)" }}>
        only you can see this · {alert.type === "silent" ? "they haven't posted in a while" : "their mood has been low"}
      </p>
    </motion.div>
  );
}
