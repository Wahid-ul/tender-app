import { motion } from "framer-motion";

export default function Archive() {
  return (
    <div className="px-4 pt-4">
      <div className="mb-6">
        <h1 className="font-hand text-3xl text-ink font-bold">archive</h1>
        <p className="text-muted text-sm mt-1">your friendship timeline</p>
      </div>
      <motion.div
        className="paper-card p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-4xl mb-3">🎞️</p>
        <p className="font-hand text-xl text-ink">coming soon</p>
        <p className="text-sm text-muted mt-1">memories accumulate over time.</p>
      </motion.div>
    </div>
  );
}
