import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { encrypt, decrypt } from "../lib/crypto";

export function useRecs(circleId, userId, inviteCode) {
  const [recs,    setRecs]    = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecs = useCallback(async () => {
    if (!circleId) return;

    const { data, error } = await supabase
      .from("recommendations")
      .select(`*, author:profiles(id, name)`)
      .eq("circle_id", circleId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const decrypted = await Promise.all(
        data.map(async (r) => ({
          ...r,
          title: await decrypt(r.title, inviteCode),
          url:   await decrypt(r.url,   inviteCode),
          note:  await decrypt(r.note,  inviteCode),
        }))
      );
      setRecs(decrypted);
    }
    setLoading(false);
  }, [circleId, inviteCode]);

  useEffect(() => { fetchRecs(); }, [fetchRecs]);

  const addRec = async ({ type, title, url, note }) => {
    const [encTitle, encUrl, encNote] = await Promise.all([
      encrypt(title,      inviteCode),
      encrypt(url,        inviteCode),
      encrypt(note||null, inviteCode),
    ]);

    const { data, error } = await supabase
      .from("recommendations")
      .insert({ circle_id: circleId, user_id: userId, type, title: encTitle, url: encUrl, note: encNote })
      .select(`*, author:profiles(id, name)`)
      .single();

    if (error) throw error;
    setRecs((prev) => [{ ...data, title, url, note: note || null }, ...prev]);
  };

  const deleteRec = async (id) => {
    await supabase.from("recommendations").delete().eq("id", id).eq("user_id", userId);
    setRecs((prev) => prev.filter((r) => r.id !== id));
  };

  return { recs, loading, addRec, deleteRec };
}
