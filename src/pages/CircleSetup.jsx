import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCircle } from "../hooks/useCircle";

const stickers = ["🌸", "☕", "🤍", "🎞️", "✉️", "🌙"];

export default function CircleSetup({ user, onDone }) {
  const { createCircle, joinCircle } = useCircle(user?.id);

  const [tab,         setTab]         = useState("create"); // create | join
  const [circleName,  setCircleName]  = useState("");
  const [inviteCode,  setInviteCode]  = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!circleName.trim()) return;
    setLoading(true);
    setError("");
    try {
      await createCircle(circleName.trim(), user.id);
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setLoading(true);
    setError("");
    try {
      await joinCircle(inviteCode.trim(), user.id);
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container min-h-screen flex flex-col" style={{ background: "var(--paper)" }}>
      {/* Floating stickers */}
      {stickers.map((s, i) => (
        <motion.span
          key={i}
          className="fixed text-2xl select-none pointer-events-none opacity-15"
          style={{ left: `${6 + i * 17}%`, top: `${8 + (i % 3) * 28}%` }}
          animate={{ y: [-8, 8, -8], rotate: [-6, 6, -6] }}
          transition={{ duration: 3.5 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
        >
          {s}
        </motion.span>
      ))}

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="text-5xl mb-3">🤍</div>
          <h1 className="font-hand text-3xl font-bold text-ink">your circle</h1>
          <p className="text-muted text-sm mt-1">
            a small group. max 10 people. just the ones who matter.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="polaroid w-full max-w-sm"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 22 }}
        >
          {/* Tab switcher */}
          <div className="flex mb-6 rounded-xl p-1" style={{ background: "var(--cream)" }}>
            {[
              { id: "create", label: "Create one" },
              { id: "join",   label: "Join one"   },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setError(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-none cursor-pointer ${
                  tab === t.id
                    ? "bg-white shadow-soft text-ink"
                    : "bg-transparent text-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── Create tab ── */}
            {tab === "create" && (
              <motion.form
                key="create"
                onSubmit={handleCreate}
                className="flex flex-col gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{   opacity: 0, x:  20 }}
                transition={{ duration: 0.2 }}
              >
                <div>
                  <label className="text-xs text-muted mb-1 block font-medium">
                    Name your circle
                  </label>
                  <input
                    className="tender-input"
                    type="text"
                    placeholder="e.g. the usuals, chaotic trio..."
                    value={circleName}
                    onChange={(e) => setCircleName(e.target.value)}
                    maxLength={40}
                    autoFocus
                    required
                  />
                  <p className="text-xs text-muted mt-1.5">
                    you'll get an invite link to share with friends
                  </p>
                </div>

                {error && <p className="text-sm text-red-400 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

                <motion.button
                  type="submit"
                  className="tender-btn tender-btn-primary"
                  disabled={loading || !circleName.trim()}
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? "Creating..." : "Create circle →"}
                </motion.button>
              </motion.form>
            )}

            {/* ── Join tab ── */}
            {tab === "join" && (
              <motion.form
                key="join"
                onSubmit={handleJoin}
                className="flex flex-col gap-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{   opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div>
                  <label className="text-xs text-muted mb-1 block font-medium">
                    Enter invite code
                  </label>
                  <input
                    className="tender-input font-hand text-xl tracking-widest text-center"
                    type="text"
                    placeholder="e.g. a3f9c2b1"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toLowerCase())}
                    maxLength={8}
                    autoFocus
                    required
                  />
                  <p className="text-xs text-muted mt-1.5">
                    ask a friend to share their invite code with you
                  </p>
                </div>

                {error && <p className="text-sm text-red-400 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

                <motion.button
                  type="submit"
                  className="tender-btn tender-btn-primary"
                  disabled={loading || inviteCode.length < 6}
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? "Joining..." : "Join circle →"}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="font-hand text-muted text-sm text-center mt-5">
            small circles. real conversations.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
