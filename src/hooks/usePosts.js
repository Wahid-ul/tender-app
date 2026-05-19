import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { encrypt, decrypt } from "../lib/crypto";

export function usePosts(circleId, userId, inviteCode) {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  const decryptPost = async (post) => {
    const [content, content_url] = await Promise.all([
      decrypt(post.content,     inviteCode),
      decrypt(post.content_url, inviteCode),
    ]);
    return { ...post, content, content_url };
  };

  const fetchPosts = useCallback(async () => {
    if (!circleId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        author:profiles(id, name, avatar_url),
        reactions(id, user_id, type)
      `)
      .eq("circle_id", circleId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error) {
      const decrypted = await Promise.all((data ?? []).map(decryptPost));
      setPosts(decrypted);
    }
    setLoading(false);
  }, [circleId, inviteCode]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Check how many posts user made today
  const getTodayCount = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { count } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("circle_id", circleId)
      .gte("created_at", `${today}T00:00:00`);
    return count ?? 0;
  };

  const createPost = async ({ type, content, content_url }) => {
    const todayCount = await getTodayCount();
    if (todayCount >= 5) throw new Error("5 posts a day is enough. come back tomorrow 🤍");

    const [encContent, encContentUrl] = await Promise.all([
      encrypt(content,     inviteCode),
      encrypt(content_url, inviteCode),
    ]);

    const { data, error } = await supabase
      .from("posts")
      .insert({ circle_id: circleId, user_id: userId, type, content: encContent, content_url: encContentUrl })
      .select(`*, author:profiles(id, name, avatar_url), reactions(id, user_id, type)`)
      .single();

    if (error) throw error;
    const decrypted = await decryptPost(data);
    setPosts((prev) => [decrypted, ...prev]);
    return decrypted;
  };

  const uploadPhoto = async (file) => {
    const ext  = file.name.split(".").pop();
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("post-media")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (error) throw error;

    const { data } = supabase.storage.from("post-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const toggleReaction = async (postId, type) => {
    const post     = posts.find((p) => p.id === postId);
    const existing = post?.reactions?.find((r) => r.user_id === userId && r.type === type);

    if (existing) {
      await supabase.from("reactions").delete().eq("id", existing.id);
    } else {
      await supabase.from("reactions").insert({ post_id: postId, user_id: userId, type });
    }
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const reactions = existing
          ? p.reactions.filter((r) => r.id !== existing.id)
          : [...p.reactions, { id: Date.now(), user_id: userId, type }];
        return { ...p, reactions };
      })
    );
  };

  return { posts, loading, createPost, uploadPhoto, toggleReaction, refetch: fetchPosts };
}
