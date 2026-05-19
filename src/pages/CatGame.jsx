import { motion, AnimatePresence } from "framer-motion";
import { useCatGame } from "../hooks/useCatGame";

const PROMPTS = [
  { text: "most likely to knock something off the table just to see what happens",   emoji: "🐾" },
  { text: "most likely to ignore texts all day then reply at 2am like nothing happened", emoji: "🌙" },
  { text: "most likely to squeeze into a space that is clearly too small for them",   emoji: "📦" },
  { text: "most likely to stare at you without blinking until you get uncomfortable", emoji: "👁️" },
  { text: "most likely to randomly start sprinting around the house for no reason",   emoji: "🏃" },
  { text: "most likely to ask for food, get it, then just walk away",                 emoji: "🍽️" },
  { text: "most likely to bite someone who was being too nice to them",               emoji: "😤" },
  { text: "most likely to sit on your laptop right when you need it",                 emoji: "💻" },
  { text: "most likely to knock over your full drink and act unbothered",             emoji: "💧" },
  { text: "most likely to bring an unsolicited gift and expect applause",             emoji: "🎁" },
  { text: "most likely to stare at a wall for 10 straight minutes",                   emoji: "🧱" },
  { text: "most likely to act like they hate everyone but secretly wants all the hugs", emoji: "🤫" },
  { text: "most likely to get absolutely feral at midnight for no reason",            emoji: "🌕" },
  { text: "most likely to headbutt you as a form of saying I love you",               emoji: "💕" },
  { text: "most likely to show up uninvited and immediately make themselves at home", emoji: "🏠" },
  { text: "most likely to knock on your door then run away",                          emoji: "🚪" },
  { text: "most likely to yell into the void at 3am for no reason at all",           emoji: "😾" },
  { text: "most likely to sit in the laundry basket like they live there",            emoji: "🧺" },
  { text: "most likely to demand attention and then immediately leave when they get it", emoji: "💨" },
  { text: "most likely to start drama and then fall asleep during the consequences",  emoji: "😴" },
];

const CAT_WINNER_TITLES = [
  "certified gremlin 🐾",
  "chaotic little creature",
  "unhinged icon 🌀",
  "the real menace",
  "absolute feral energy",
  "voted most unwell (affectionately)",
  "peak cat behaviour",
];

function getWinnerTitle(seed) {
  return CAT_WINNER_TITLES[seed % CAT_WINNER_TITLES.length];
}

export default function CatGame({ user, circle }) {
  const { game, votes, members, myVote, loading, vote, nextRound } = useCatGame(
    circle?.id,
    user?.id
  );

  if (loading) {
    return (
      <div className="px-4 pt-4">
        <div className="mb-6">
          <h1 className="font-hand text-3xl text-ink font-bold">paws & vote 🐾</h1>
        </div>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="polaroid animate-pulse">
              <div className="h-6 w-3/4 rounded bg-cream mb-3" />
              <div className="h-4 w-full rounded bg-cream mb-2" />
              <div className="h-4 w-2/3 rounded bg-cream" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const promptIndex  = game?.prompt_index ?? 0;
  const currentPrompt = PROMPTS[promptIndex % PROMPTS.length];
  const totalVotes   = votes.length;
  const allVoted     = members.length > 0 && totalVotes >= members.length;

  // Count votes per member
  const voteCounts = members.reduce((acc, m) => {
    acc[m.id] = votes.filter((v) => v.voted_for === m.id).length;
    return acc;
  }, {});

  const maxVotes  = Math.max(...Object.values(voteCounts), 1);
  const winnerId  = Object.entries(voteCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const winner    = members.find((m) => m.id === winnerId);
  const isTie     = Object.values(voteCounts).filter((c) => c === maxVotes).length > 1;

  return (
    <div className="px-4 pt-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="font-hand text-3xl text-ink font-bold">paws & vote 🐾</h1>
          <p className="text-muted text-sm mt-0.5">
            round {(promptIndex % PROMPTS.length) + 1} of {PROMPTS.length}
          </p>
        </div>
        <span className="text-3xl animate-bounce">🐱</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full mb-5" style={{ background: "var(--cream)" }}>
        <motion.div
          className="h-1.5 rounded-full"
          style={{ background: "var(--ink)" }}
          initial={{ width: 0 }}
          animate={{ width: `${(((promptIndex % PROMPTS.length) + 1) / PROMPTS.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Prompt card */}
      <motion.div
        key={promptIndex}
        className="polaroid mb-6 text-center"
        initial={{ opacity: 0, y: 24, rotate: -2 }}
        animate={{ opacity: 1, y: 0,  rotate: 0  }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
      >
        <p className="text-5xl mb-4">{currentPrompt.emoji}</p>
        <p className="font-hand text-2xl text-ink font-bold leading-snug">
          {currentPrompt.text}
        </p>
        <p className="text-xs text-muted mt-3">
          {totalVotes}/{members.length} paws in
        </p>
      </motion.div>

      {/* ── VOTING STATE — haven't voted yet ── */}
      <AnimatePresence mode="wait">
        {!myVote && (
          <motion.div
            key="voting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-xs text-muted font-medium mb-3 text-center">tap to cast your paw 🐾</p>
            <div className="grid grid-cols-2 gap-3">
              {members.map((member, i) => {
                const isMe = member.id === user.id;
                return (
                  <motion.button
                    key={member.id}
                    onClick={() => vote(member.id)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border-none cursor-pointer"
                    style={{ background: "var(--cream)" }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ scale: 1.04, background: "var(--blush)" }}
                    whileTap={{ scale: 0.94 }}
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold"
                      style={{ background: "var(--blush)", border: isMe ? "2.5px solid var(--ink)" : "none" }}
                    >
                      {member.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <p className="font-hand text-base text-ink font-semibold">
                      {isMe ? "me 😈" : member.name?.split(" ")[0]}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── RESULTS STATE — already voted ── */}
        {myVote && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1,  y: 0  }}
            exit={{ opacity: 0 }}
          >
            {/* Winner banner */}
            {allVoted && !isTie && winner && (
              <motion.div
                className="paper-card p-5 text-center mb-5"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1,    opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
              >
                <motion.p
                  className="text-5xl mb-2"
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  🏆
                </motion.p>
                <p className="font-hand text-3xl text-ink font-bold">
                  {winner.name?.split(" ")[0]}
                </p>
                <p className="text-sm text-muted mt-1">
                  {getWinnerTitle(winner.name?.charCodeAt(0) ?? 0)}
                </p>
              </motion.div>
            )}

            {isTie && allVoted && (
              <motion.div
                className="paper-card p-4 text-center mb-5"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1,   opacity: 1 }}
              >
                <p className="text-4xl mb-2">😹</p>
                <p className="font-hand text-2xl text-ink font-bold">it's a tie</p>
                <p className="text-sm text-muted mt-1">you're all equally unhinged.</p>
              </motion.div>
            )}

            {/* Vote bars */}
            <div className="flex flex-col gap-3 mb-6">
              {members
                .slice()
                .sort((a, b) => (voteCounts[b.id] ?? 0) - (voteCounts[a.id] ?? 0))
                .map((member, i) => {
                  const count   = voteCounts[member.id] ?? 0;
                  const pct     = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                  const isWinner = member.id === winnerId && !isTie && count > 0;
                  const isMe    = member.id === user.id;
                  const votedForThem = myVote === member.id;

                  return (
                    <motion.div
                      key={member.id}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1,  x: 0   }}
                      transition={{ delay: i * 0.07 }}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{
                          background: isWinner ? "var(--ink)" : "var(--blush)",
                          color:      isWinner ? "#fff"       : "var(--ink)",
                        }}
                      >
                        {isWinner ? "🐱" : member.name?.[0]?.toUpperCase()}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-ink">
                            {isMe ? `${member.name?.split(" ")[0]} (you)` : member.name?.split(" ")[0]}
                            {votedForThem && <span className="ml-1 text-xs text-muted">← your paw</span>}
                          </span>
                          <span className="text-xs text-muted">{count} {count === 1 ? "paw" : "paws"}</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "var(--cream)" }}>
                          <motion.div
                            className="h-2.5 rounded-full"
                            style={{ background: isWinner ? "var(--ink)" : "var(--blush)" }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>

            {/* Waiting on others */}
            {!allVoted && (
              <p className="text-center text-sm text-muted font-hand text-lg mb-4 animate-pulse">
                waiting for {members.length - totalVotes} more paw{members.length - totalVotes !== 1 ? "s" : ""}...
              </p>
            )}

            {/* Next round */}
            <motion.button
              className="tender-btn tender-btn-primary w-full"
              onClick={nextRound}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1,  y: 0  }}
              transition={{ delay: 0.4 }}
            >
              next paw 🐾
            </motion.button>

            {promptIndex % PROMPTS.length === PROMPTS.length - 1 && (
              <p className="text-center text-xs text-muted mt-2">
                last round — it'll loop back to the start
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
