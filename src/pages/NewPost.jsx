import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";

const POST_TYPES = [
  { id: "text",  label: "tiny status",   emoji: "✍️",  desc: "one liner. emotional breadcrumb."    },
  { id: "photo", label: "photo",         emoji: "📷",  desc: "drop one photo from your day."       },
  { id: "mood",  label: "mood check-in", emoji: "🌡️", desc: "just let them know how you are."     },
];

const MOODS = [
  { id: "surviving",     emoji: "😮‍💨", color: "#fde8d8" },
  { id: "thriving",      emoji: "🌱",  color: "#d8f0e0" },
  { id: "feral",         emoji: "🐺",  color: "#ede8fd" },
  { id: "numb",          emoji: "🌫️", color: "#e8e8e8" },
  { id: "productive",    emoji: "⚡",  color: "#d8eafd" },
  { id: "romanticizing", emoji: "🎞️", color: "#fde8f0" },
];

export default function NewPost({ user, circle }) {
  const navigate = useNavigate();
  const { createPost, uploadPhoto } = usePosts(circle?.id, user?.id);

  const [step,       setStep]       = useState("pick");   // pick | form
  const [postType,   setPostType]   = useState(null);
  const [text,       setText]       = useState("");
  const [caption,    setCaption]    = useState("");
  const [mood,       setMood]       = useState(null);
  const [photoFile,  setPhotoFile]  = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const fileRef = useRef();

  const selectType = (type) => {
    setPostType(type);
    setStep("form");
    setError("");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      if (postType === "text") {
        if (!text.trim()) throw new Error("Write something first.");
        await createPost({ type: "text", content: text.trim() });
      } else if (postType === "mood") {
        if (!mood) throw new Error("Pick a mood.");
        await createPost({ type: "mood", content: mood });
      } else if (postType === "photo") {
        if (!photoFile) throw new Error("Pick a photo first.");
        const url = await uploadPhoto(photoFile);
        await createPost({ type: "photo", content: caption.trim() || null, content_url: url });
      }
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("pick");
    setPostType(null);
    setText("");
    setCaption("");
    setMood(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setError("");
  };

  return (
    <div className="px-4 pt-4 pb-4">
      <div className="flex items-center gap-3 mb-6">
        {step === "form" && (
          <button onClick={reset} className="text-muted text-sm border-none bg-transparent cursor-pointer p-0">
            ←
          </button>
        )}
        <h1 className="font-hand text-3xl text-ink font-bold">
          {step === "pick" ? "what happened?" : postType === "text" ? "tiny status" : postType === "photo" ? "photo" : "mood"}
        </h1>
      </div>

      <AnimatePresence mode="wait">
        {/* ── Type picker ── */}
        {step === "pick" && (
          <motion.div
            key="pick"
            className="flex flex-col gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {POST_TYPES.map((type, i) => (
              <motion.button
                key={type.id}
                className="flex items-center gap-4 p-4 rounded-2xl text-left border-none cursor-pointer w-full"
                style={{ background: "var(--cream)", border: "1px solid rgba(0,0,0,0.06)" }}
                onClick={() => selectType(type.id)}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ x: 4, background: "var(--blush)" }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-3xl">{type.emoji}</span>
                <div>
                  <p className="font-hand text-xl text-ink font-semibold leading-tight">{type.label}</p>
                  <p className="text-xs text-muted mt-0.5">{type.desc}</p>
                </div>
                <span className="ml-auto text-muted">→</span>
              </motion.button>
            ))}
            <p className="text-center text-xs text-muted mt-4 opacity-60">
              5 posts per day · no algorithm · just friends
            </p>
          </motion.div>
        )}

        {/* ── Text form ── */}
        {step === "form" && postType === "text" && (
          <motion.div
            key="text-form"
            className="flex flex-col gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <textarea
              className="tender-input font-hand text-2xl resize-none leading-relaxed"
              rows={4}
              placeholder="cried in the lab bathroom. productive day."
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={280}
              autoFocus
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted">{text.length}/280</span>
            </div>
            {error && <p className="text-sm text-red-400 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <motion.button
              className="tender-btn tender-btn-primary"
              onClick={handleSubmit}
              disabled={loading || !text.trim()}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? "Posting..." : "Post it 🤍"}
            </motion.button>
          </motion.div>
        )}

        {/* ── Photo form ── */}
        {step === "form" && postType === "photo" && (
          <motion.div
            key="photo-form"
            className="flex flex-col gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />

            {photoPreview ? (
              <div className="polaroid cursor-pointer" onClick={() => fileRef.current?.click()}>
                <img src={photoPreview} alt="preview" className="w-full object-cover rounded-sm max-h-72" />
                <p className="font-hand text-sm text-muted text-center mt-2">tap to change</p>
              </div>
            ) : (
              <motion.button
                className="flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed cursor-pointer w-full border-none"
                style={{ background: "var(--cream)", border: "2px dashed rgba(0,0,0,0.15)" }}
                onClick={() => fileRef.current?.click()}
                whileHover={{ background: "var(--blush)" }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-4xl">📷</span>
                <p className="font-hand text-xl text-muted">tap to pick a photo</p>
              </motion.button>
            )}

            <input
              className="tender-input font-hand text-lg"
              type="text"
              placeholder="add a caption... (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={140}
            />

            {error && <p className="text-sm text-red-400 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <motion.button
              className="tender-btn tender-btn-primary"
              onClick={handleSubmit}
              disabled={loading || !photoFile}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? "Uploading..." : "Post photo 🤍"}
            </motion.button>
          </motion.div>
        )}

        {/* ── Mood form ── */}
        {step === "form" && postType === "mood" && (
          <motion.div
            key="mood-form"
            className="flex flex-col gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <p className="text-muted text-sm">how are you really feeling?</p>
            <div className="grid grid-cols-2 gap-3">
              {MOODS.map((m, i) => (
                <motion.button
                  key={m.id}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 cursor-pointer border-none"
                  style={{
                    background: m.color,
                    borderColor: mood === m.id ? "rgba(0,0,0,0.25)" : "transparent",
                    outline: mood === m.id ? "2px solid rgba(0,0,0,0.2)" : "none",
                  }}
                  onClick={() => setMood(m.id)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <span className="text-3xl">{m.emoji}</span>
                  <span className="font-hand text-lg text-ink font-semibold">{m.id}</span>
                </motion.button>
              ))}
            </div>
            {error && <p className="text-sm text-red-400 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <motion.button
              className="tender-btn tender-btn-primary mt-2"
              onClick={handleSubmit}
              disabled={loading || !mood}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? "Posting..." : "Share mood 🤍"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
