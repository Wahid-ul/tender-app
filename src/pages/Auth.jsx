import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

const stickers = ["🌸", "🎞️", "☕", "🌙", "🤍", "✉️"];

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [mode,    setMode]    = useState("login"); // login | signup
  const [email,   setEmail]   = useState("");
  const [password,setPassword]= useState("");
  const [name,    setName]    = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await signUp(email, password, { data: { name } });
        if (error) throw error;
        setDone(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="app-container flex flex-col items-center justify-center min-h-screen px-6">
        <motion.div
          className="paper-card p-8 text-center w-full max-w-sm"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="font-hand text-2xl text-ink mb-2">Check your email</h2>
          <p className="text-muted text-sm leading-relaxed">
            We sent a confirmation link to <strong>{email}</strong>.
            <br />Open it and come back here.
          </p>
          <button
            className="tender-btn tender-btn-ghost mt-6"
            onClick={() => { setDone(false); setMode("login"); }}
          >
            Back to login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app-container flex flex-col min-h-screen" style={{ background: "var(--paper)" }}>
      {/* Decorative stickers */}
      {stickers.map((s, i) => (
        <motion.span
          key={i}
          className="fixed text-2xl select-none pointer-events-none opacity-20"
          style={{
            left:  `${8 + i * 16}%`,
            top:   `${10 + (i % 3) * 30}%`,
          }}
          animate={{ y: [-6, 6, -6], rotate: [-5, 5, -5] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
        >
          {s}
        </motion.span>
      ))}

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        {/* Logo */}
        <motion.div
          className="text-center mb-10"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0,   opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-5xl mb-3">🤍</div>
          <h1 className="font-hand text-4xl font-bold text-ink">Tender</h1>
          <p className="text-muted text-sm mt-1 tracking-wide">just us.</p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="polaroid w-full max-w-sm"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 22 }}
        >
          {/* Tab switcher */}
          <div className="flex mb-6 bg-cream rounded-xl p-1">
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-none ${
                  mode === m
                    ? "bg-white shadow-soft text-ink"
                    : "bg-transparent text-muted"
                }`}
              >
                {m === "login" ? "Sign in" : "Join"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{   opacity: 0, x: mode === "login" ?  20 : -20 }}
              transition={{ duration: 0.22 }}
            >
              {mode === "signup" && (
                <div>
                  <label className="text-xs text-muted mb-1 block font-medium">Your name</label>
                  <input
                    className="tender-input"
                    type="text"
                    placeholder="how your friends call you"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-muted mb-1 block font-medium">Email</label>
                <input
                  className="tender-input"
                  type="email"
                  placeholder="you@somewhere.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus={mode === "login"}
                />
              </div>

              <div>
                <label className="text-xs text-muted mb-1 block font-medium">Password</label>
                <input
                  className="tender-input"
                  type="password"
                  placeholder="something memorable"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <motion.p
                  className="text-sm text-red-400 bg-red-50 px-3 py-2 rounded-lg"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1,  y: 0 }}
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                type="submit"
                className="tender-btn tender-btn-primary mt-2"
                disabled={loading}
                whileHover={{ opacity: 0.88 }}
                whileTap={{ scale: 0.97 }}
              >
                {loading
                  ? "..."
                  : mode === "login"
                  ? "Come in 🤍"
                  : "Create my space →"}
              </motion.button>
            </motion.form>
          </AnimatePresence>

          {/* Handwritten note at bottom of polaroid */}
          <p className="font-hand text-muted text-sm text-center mt-6">
            {mode === "login"
              ? "missed you."
              : "no followers. no performance. just life."}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
