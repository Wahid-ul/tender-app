import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DisappearMode, { DISAPPEAR_OPTIONS } from "../components/ui/DisappearMode";
import { useDisappear } from "../hooks/useDisappear";

export default function Profile({ user, circle, signOut }) {
  const [copied,          setCopied]          = useState(false);
  const [showDisappear,   setShowDisappear]    = useState(false);
  const inviteCode   = circle?.invite_code ?? "";
  const { myStatus, clearDisappear }          = useDisappear(user?.id, inviteCode);
  const activeOption = DISAPPEAR_OPTIONS.find((o) => o.id === myStatus?.status);

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-4 pt-4 pb-4 flex flex-col gap-4">
      <h1 className="font-hand text-3xl text-ink font-bold">me</h1>

      {/* Profile card */}
      <motion.div
        className="polaroid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{ background: "var(--blush)" }}
          >
            🤍
          </div>
          <div>
            <p className="font-hand text-2xl text-ink font-bold">
              {user?.user_metadata?.name ?? "you"}
            </p>
            <p className="text-xs text-muted mt-0.5">{user?.email}</p>
          </div>
        </div>
        <p className="font-hand text-lg text-muted mt-3">
          "posting without performing."
        </p>
      </motion.div>

      {/* Disappear Mode */}
      <motion.div
        className="paper-card p-4 flex flex-col gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted font-medium">quiet mode</p>
            {activeOption ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span>{activeOption.emoji}</span>
                <p className="font-hand text-lg text-ink font-semibold">{activeOption.label}</p>
              </div>
            ) : (
              <p className="font-hand text-lg text-muted">not active</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeOption && (
              <button
                onClick={clearDisappear}
                className="text-xs text-muted border-none bg-transparent cursor-pointer"
              >
                clear
              </button>
            )}
            <motion.button
              className="tender-btn tender-btn-ghost px-4 py-2 text-sm"
              style={{ width: "auto" }}
              onClick={() => setShowDisappear((v) => !v)}
              whileTap={{ scale: 0.96 }}
            >
              {showDisappear ? "close" : activeOption ? "change" : "go quiet"}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {showDisappear && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div className="pt-2 border-t border-black/5">
                <DisappearMode user={user} inviteCode={inviteCode} onClose={() => setShowDisappear(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Circle + invite */}
      {circle && (
        <motion.div
          className="paper-card p-4 flex flex-col gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted font-medium">your circle</p>
              <p className="font-hand text-xl text-ink font-semibold mt-0.5">{circle.name}</p>
            </div>
            <span className="text-2xl">🌸</span>
          </div>

          <div>
            <p className="text-xs text-muted mb-2 font-medium">invite code — share with friends</p>
            <div className="flex items-center gap-2">
              <div
                className="flex-1 rounded-xl px-4 py-3 text-center"
                style={{ background: "var(--cream)", border: "1px dashed rgba(0,0,0,0.15)" }}
              >
                <span className="font-hand text-2xl text-ink tracking-widest font-bold">
                  {inviteCode}
                </span>
              </div>
              <motion.button
                className="tender-btn tender-btn-primary rounded-xl text-sm"
                style={{ width: "auto", padding: "12px 16px" }}
                onClick={copyCode}
                whileTap={{ scale: 0.94 }}
              >
                {copied ? "✓" : "Copy"}
              </motion.button>
            </div>
            <p className="text-xs text-muted mt-2 text-center">
              max 10 people · friends enter this on the Join screen
            </p>
          </div>
        </motion.div>
      )}

      <motion.button
        className="tender-btn tender-btn-ghost"
        onClick={signOut}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        whileTap={{ scale: 0.97 }}
      >
        sign out
      </motion.button>
    </div>
  );
}
