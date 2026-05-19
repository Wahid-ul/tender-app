import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRecs } from "../hooks/useRecs";

const TYPES = [
  { id: "youtube", label: "YouTube", emoji: "🎬", color: "#fde8d8", placeholder: "https://youtube.com/watch?v=..." },
  { id: "movie",   label: "Movie",   emoji: "🎥", color: "#d8eafd", placeholder: "https://imdb.com/title/..."      },
  { id: "music",   label: "Music",   emoji: "🎵", color: "#ede8fd", placeholder: "https://open.spotify.com/..."   },
];

const ALL_FILTERS = [{ id: "all", label: "All", emoji: "✨" }, ...TYPES];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function RecCard({ rec, currentUserId, onDelete, index }) {
  const typeDef = TYPES.find((t) => t.id === rec.type);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isOwn = rec.user_id === currentUserId;

  return (
    <motion.div
      className="polaroid"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 280, damping: 24 }}
    >
      {/* Type badge + meta */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: typeDef?.color, color: "var(--ink)" }}
          >
            {typeDef?.emoji} {typeDef?.label}
          </span>
        </div>

        {isOwn && (
          <div>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDelete(rec.id)}
                  className="text-xs text-red-400 border-none bg-transparent cursor-pointer font-medium"
                >
                  delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-muted border-none bg-transparent cursor-pointer"
                >
                  cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-muted border-none bg-transparent cursor-pointer opacity-50 hover:opacity-100"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <p className="font-hand text-xl text-ink font-semibold leading-snug mb-1">{rec.title}</p>

      {/* Note */}
      {rec.note && (
        <p className="text-sm text-muted leading-relaxed mb-3">{rec.note}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-1.5">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
            style={{ background: "var(--blush)" }}
          >
            {rec.author?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="text-xs text-muted">{rec.author?.name} · {timeAgo(rec.created_at)}</span>
        </div>

        <a
          href={rec.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-ink px-3 py-1.5 rounded-full border-none cursor-pointer no-underline"
          style={{ background: "var(--cream)" }}
        >
          open →
        </a>
      </div>
    </motion.div>
  );
}

function AddSheet({ circle, userId, inviteCode, onAdd, onClose }) {
  const { addRec } = useRecs(circle.id, userId, inviteCode);
  const [step,    setStep]    = useState("type");  // type | form
  const [type,    setType]    = useState(null);
  const [title,   setTitle]   = useState("");
  const [url,     setUrl]     = useState("");
  const [note,    setNote]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const typeDef = TYPES.find((t) => t.id === type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    setLoading(true);
    setError("");
    try {
      await addRec({ type, title: title.trim(), url: url.trim(), note: note.trim() });
      onAdd();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col justify-end"
      style={{ background: "rgba(0,0,0,0.3)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="rounded-t-3xl px-5 pt-5 pb-10"
        style={{ background: "var(--paper)", maxHeight: "85vh", overflowY: "auto" }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "rgba(0,0,0,0.15)" }} />

        <h2 className="font-hand text-2xl text-ink font-bold mb-5">
          {step === "type" ? "what are you sharing?" : `share a ${typeDef?.label}`}
        </h2>

        <AnimatePresence mode="wait">
          {/* Step 1 — pick type */}
          {step === "type" && (
            <motion.div
              key="type"
              className="flex flex-col gap-3"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
            >
              {TYPES.map((t, i) => (
                <motion.button
                  key={t.id}
                  className="flex items-center gap-4 p-4 rounded-2xl text-left border-none cursor-pointer w-full"
                  style={{ background: t.color }}
                  onClick={() => { setType(t.id); setStep("form"); }}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-3xl">{t.emoji}</span>
                  <p className="font-hand text-xl text-ink font-semibold">{t.label}</p>
                  <span className="ml-auto text-muted">→</span>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Step 2 — fill form */}
          {step === "form" && (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
            >
              <div>
                <label className="text-xs text-muted font-medium mb-1 block">Title *</label>
                <input
                  className="tender-input font-hand text-lg"
                  placeholder="e.g. Interstellar, Lo-fi beats playlist..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="text-xs text-muted font-medium mb-1 block">Link *</label>
                <input
                  className="tender-input text-sm"
                  placeholder={typeDef?.placeholder}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  type="url"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-muted font-medium mb-1 block">Why are you sharing this? (optional)</label>
                <textarea
                  className="tender-input font-hand text-base resize-none"
                  rows={3}
                  placeholder="this one wrecked me at 2am..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={200}
                />
              </div>

              {error && <p className="text-sm text-red-400 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  className="tender-btn tender-btn-ghost flex-1"
                  onClick={() => setStep("type")}
                >
                  ← back
                </button>
                <motion.button
                  type="submit"
                  className="tender-btn tender-btn-primary flex-[2]"
                  disabled={loading || !title.trim() || !url.trim()}
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? "Sharing..." : "Share it 🤍"}
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default function Recs({ user, circle }) {
  const { recs, loading, deleteRec, refetch } = useRecs(circle?.id, user?.id, circle?.invite_code);
  const [filter,   setFilter]   = useState("all");
  const [showAdd,  setShowAdd]  = useState(false);

  const filtered = filter === "all" ? recs : recs.filter((r) => r.type === filter);

  return (
    <div className="px-4 pt-4 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="font-hand text-3xl text-ink font-bold">recs</h1>
          <p className="text-muted text-sm mt-1">things worth sharing</p>
        </div>
        <motion.button
          className="tender-btn tender-btn-primary text-sm px-4 py-2"
          onClick={() => setShowAdd(true)}
          whileTap={{ scale: 0.95 }}
        >
          + share
        </motion.button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {ALL_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border-none cursor-pointer transition-all"
            style={{
              background: filter === f.id ? "var(--ink)"   : "var(--cream)",
              color:      filter === f.id ? "#fff"          : "var(--muted)",
            }}
          >
            <span>{f.emoji}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="polaroid animate-pulse">
              <div className="h-4 w-20 rounded-full bg-cream mb-3" />
              <div className="h-6 w-3/4 rounded bg-cream mb-2" />
              <div className="h-3 w-full rounded bg-cream mb-1" />
              <div className="h-3 w-2/3 rounded bg-cream" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <motion.div
          className="paper-card p-10 text-center mt-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-5xl mb-3">
            {filter === "youtube" ? "🎬" : filter === "movie" ? "🎥" : filter === "music" ? "🎵" : "💡"}
          </p>
          <p className="font-hand text-xl text-ink">nothing here yet</p>
          <p className="text-sm text-muted mt-1">
            {filter === "all"
              ? "share something worth watching, listening to, or exploring."
              : `no ${filter} recs yet. be the first.`}
          </p>
        </motion.div>
      )}

      {/* Rec cards */}
      <div className="flex flex-col gap-5">
        {filtered.map((rec, i) => (
          <RecCard
            key={rec.id}
            rec={rec}
            currentUserId={user.id}
            onDelete={deleteRec}
            index={i}
          />
        ))}
      </div>

      {/* Add sheet */}
      <AnimatePresence>
        {showAdd && (
          <AddSheet
            circle={circle}
            userId={user.id}
            inviteCode={circle?.invite_code}
            onAdd={() => {}}
            onClose={() => setShowAdd(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
