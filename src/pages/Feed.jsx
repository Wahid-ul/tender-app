import { motion, AnimatePresence } from "framer-motion";
import { usePosts }       from "../hooks/usePosts";
import { useSoftAlerts }  from "../hooks/useSoftAlerts";
import PostCard           from "../components/ui/PostCard";
import CircleStatusBar    from "../components/ui/CircleStatusBar";
import SoftAlertCard      from "../components/ui/SoftAlertCard";

export default function Feed({ user, circle }) {
  const { posts, loading, toggleReaction }    = usePosts(circle?.id, user?.id);
  const { alerts, dismiss }                   = useSoftAlerts(circle?.id, user?.id);
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" });

  if (loading) {
    return (
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-hand text-3xl text-ink font-bold">today</h1>
          <span className="text-muted text-sm">{today}</span>
        </div>
        <div className="flex gap-3 mb-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-full bg-cream animate-pulse" />
              <div className="w-8 h-2 rounded bg-cream animate-pulse" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="polaroid animate-pulse">
              <div className="h-4 bg-cream rounded w-24 mb-3" />
              <div className="h-6 bg-cream rounded w-full mb-2" />
              <div className="h-6 bg-cream rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4">
        <div>
          <h1 className="font-hand text-3xl text-ink font-bold">today</h1>
          <p className="text-xs text-muted mt-0.5">{circle?.name}</p>
        </div>
        <span className="text-muted text-sm">{today}</span>
      </div>

      {/* Circle status bar */}
      <CircleStatusBar circle={circle} currentUserId={user?.id} />

      {/* Soft alerts */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div
            className="flex flex-col gap-3 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Section label */}
            <p className="px-4 text-xs font-medium" style={{ color: "rgba(0,0,0,0.3)" }}>
              gentle nudge
            </p>
            <AnimatePresence>
              {alerts.map((alert) => (
                <SoftAlertCard
                  key={alert.id}
                  alert={alert}
                  onDismiss={dismiss}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider */}
      <div className="mx-4 mb-5" style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />

      {/* Empty state */}
      {posts.length === 0 && (
        <motion.div
          className="paper-card mx-4 p-8 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-4xl mb-3">🌸</p>
          <p className="font-hand text-xl text-ink">nothing yet today</p>
          <p className="text-sm text-muted mt-1">
            be the first to drop something. tap ✏️ below.
          </p>
        </motion.div>
      )}

      {/* Posts */}
      <div className="flex flex-col gap-5 px-4">
        {posts.map((post, i) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={user?.id}
            onReact={toggleReaction}
            index={i}
          />
        ))}

        {posts.length > 0 && (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="font-hand text-xl text-muted">that's everything 🤍</p>
            <p className="text-xs text-muted mt-1 opacity-60">come back tomorrow</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
