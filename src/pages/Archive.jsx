import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { decrypt } from "../lib/crypto";
import PostCard from "../components/ui/PostCard";

const PAGE_SIZE = 30;

function groupByMonth(posts) {
  const groups = {};
  for (const post of posts) {
    const key = new Date(post.created_at).toLocaleDateString("en-US", {
      month: "long",
      year:  "numeric",
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(post);
  }
  return Object.entries(groups);
}

export default function Archive({ user, circle }) {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page,    setPage]    = useState(0);

  const fetchPage = useCallback(async (pageIndex) => {
    if (!circle?.id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("posts")
      .select(`*, author:profiles(id, name, avatar_url), reactions(id, user_id, type)`)
      .eq("circle_id", circle.id)
      .order("created_at", { ascending: false })
      .range(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE - 1);

    if (!error && data) {
      const decrypted = await Promise.all(
        data.map(async (post) => ({
          ...post,
          content:     await decrypt(post.content,     circle.invite_code),
          content_url: await decrypt(post.content_url, circle.invite_code),
        }))
      );
      setPosts((prev) => (pageIndex === 0 ? decrypted : [...prev, ...decrypted]));
      setHasMore(data.length === PAGE_SIZE);
    }
    setLoading(false);
  }, [circle?.id, circle?.invite_code]);

  useEffect(() => {
    setPage(0);
    fetchPage(0);
  }, [fetchPage]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPage(next);
  };

  const toggleReaction = async (postId, type) => {
    const post     = posts.find((p) => p.id === postId);
    const existing = post?.reactions?.find((r) => r.user_id === user.id && r.type === type);

    if (existing) {
      await supabase.from("reactions").delete().eq("id", existing.id);
    } else {
      await supabase.from("reactions").insert({ post_id: postId, user_id: user.id, type });
    }

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const reactions = existing
          ? p.reactions.filter((r) => r.id !== existing.id)
          : [...p.reactions, { id: Date.now(), user_id: user.id, type }];
        return { ...p, reactions };
      })
    );
  };

  const grouped = groupByMonth(posts);

  return (
    <div className="px-4 pt-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-hand text-3xl text-ink font-bold">archive</h1>
        <p className="text-muted text-sm mt-1">your friendship timeline</p>
      </div>

      {/* Loading skeletons */}
      {loading && posts.length === 0 && (
        <div className="flex flex-col gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="polaroid animate-pulse">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-cream" />
                <div className="flex flex-col gap-1">
                  <div className="h-3 w-20 rounded bg-cream" />
                  <div className="h-2 w-12 rounded bg-cream" />
                </div>
              </div>
              <div className="h-14 rounded-lg bg-cream mb-3" />
              <div className="flex gap-2">
                {[1,2,3].map((j) => <div key={j} className="h-7 w-10 rounded-full bg-cream" />)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && posts.length === 0 && (
        <motion.div
          className="paper-card p-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-5xl mb-3">🎞️</p>
          <p className="font-hand text-xl text-ink">nothing here yet</p>
          <p className="text-sm text-muted mt-1">memories accumulate over time.</p>
        </motion.div>
      )}

      {/* Month groups */}
      <div className="flex flex-col gap-10">
        {grouped.map(([month, monthPosts], gi) => (
          <motion.section
            key={month}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.06, duration: 0.35 }}
          >
            {/* Month header */}
            <div className="flex items-center gap-3 mb-5">
              <h2 className="font-hand text-2xl text-ink font-bold whitespace-nowrap">{month}</h2>
              <div
                className="flex-1 border-b border-dashed"
                style={{ borderColor: "rgba(0,0,0,0.13)" }}
              />
              <span className="text-xs text-muted whitespace-nowrap">
                {monthPosts.length} {monthPosts.length === 1 ? "memory" : "memories"}
              </span>
            </div>

            {/* Posts */}
            <div className="flex flex-col gap-5">
              {monthPosts.map((post, i) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user.id}
                  onReact={toggleReaction}
                  index={i}
                />
              ))}
            </div>
          </motion.section>
        ))}
      </div>

      {/* Load more */}
      {hasMore && !loading && posts.length > 0 && (
        <motion.button
          className="tender-btn tender-btn-ghost w-full mt-10"
          onClick={loadMore}
          whileTap={{ scale: 0.97 }}
        >
          load older memories
        </motion.button>
      )}

      {loading && posts.length > 0 && (
        <p className="font-hand text-center text-muted text-lg mt-8 animate-pulse">
          loading...
        </p>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="font-hand text-center text-muted text-base mt-10 opacity-60">
          that's everything 🤍
        </p>
      )}
    </div>
  );
}
