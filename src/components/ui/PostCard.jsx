import { motion } from "framer-motion";

const REACTIONS = [
  { type: "hug",      emoji: "🤗", label: "hug"          },
  { type: "tea",      emoji: "☕", label: "tea"          },
  { type: "chaos",    emoji: "🌀", label: "chaos"        },
  { type: "proud",    emoji: "🦋", label: "proud"        },
  { type: "screaming",emoji: "😭", label: "screaming"    },
  { type: "soup",     emoji: "🍲", label: "sending soup" },
];

const MOOD_STYLES = {
  surviving:     { bg: "#fde8d8", color: "#c0622a" },
  thriving:      { bg: "#d8f0e0", color: "#2a7a47" },
  feral:         { bg: "#ede8fd", color: "#5a2ac0" },
  numb:          { bg: "#e8e8e8", color: "#5a5a5a" },
  productive:    { bg: "#d8eafd", color: "#2a5ac0" },
  romanticizing: { bg: "#fde8f0", color: "#c02a5a" },
};

const MOOD_EMOJIS = {
  surviving: "😮‍💨", thriving: "🌱", feral: "🐺",
  numb: "🌫️", productive: "⚡", romanticizing: "🎞️",
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function PostCard({ post, currentUserId, onReact, index = 0 }) {
  const rotation = ((post.id?.charCodeAt(0) ?? 0) % 7) - 3; // -3 to +3 deg
  const moodStyle = MOOD_STYLES[post.content] ?? MOOD_STYLES.surviving;

  const reactionCounts = REACTIONS.map((r) => ({
    ...r,
    count:   post.reactions?.filter((rx) => rx.type === r.type).length ?? 0,
    reacted: post.reactions?.some((rx) => rx.type === r.type && rx.user_id === currentUserId),
  }));

  return (
    <motion.div
      className="polaroid"
      style={{ transform: `rotate(${rotation}deg)` }}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: "spring", stiffness: 280, damping: 24 }}
      whileHover={{ scale: 1.01, rotate: 0, transition: { duration: 0.18 } }}
    >
      {/* Author row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: "var(--blush)" }}
          >
            {post.author?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink leading-none">
              {post.author?.name ?? "friend"}
            </p>
            <p className="text-xs text-muted mt-0.5">{timeAgo(post.created_at)}</p>
          </div>
        </div>

        {/* Type badge */}
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--cream)", color: "var(--muted)" }}>
          {post.type === "photo" ? "📷" : post.type === "voice" ? "🎙️" : post.type === "mood" ? "🌡️" : "✍️"}
        </span>
      </div>

      {/* Content */}
      {post.type === "text" && (
        <p className="font-hand text-xl text-ink leading-snug mb-4">{post.content}</p>
      )}

      {post.type === "mood" && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl" style={{ background: moodStyle.bg }}>
          <span className="text-3xl">{MOOD_EMOJIS[post.content] ?? "😶"}</span>
          <div>
            <p className="text-xs font-medium" style={{ color: moodStyle.color }}>feeling</p>
            <p className="font-hand text-2xl font-bold" style={{ color: moodStyle.color }}>
              {post.content}
            </p>
          </div>
        </div>
      )}

      {post.type === "photo" && post.content_url && (
        <div className="mb-3 rounded-sm overflow-hidden">
          <img
            src={post.content_url}
            alt="post"
            className="w-full object-cover max-h-72"
          />
          {post.content && (
            <p className="font-hand text-base text-muted mt-2 px-1">{post.content}</p>
          )}
        </div>
      )}

      {/* Reactions */}
      <div className="flex gap-1.5 flex-wrap mt-1">
        {reactionCounts.map((r) => (
          <motion.button
            key={r.type}
            onClick={() => onReact(post.id, r.type)}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-sm border-none cursor-pointer transition-all"
            style={{
              background: r.reacted ? "var(--blush)" : "var(--cream)",
              border: r.reacted ? "1.5px solid rgba(0,0,0,0.12)" : "1.5px solid transparent",
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.88 }}
          >
            <span className="text-base leading-none">{r.emoji}</span>
            {r.count > 0 && (
              <span className="text-xs font-semibold text-ink">{r.count}</span>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
