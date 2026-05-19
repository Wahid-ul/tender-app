import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { encrypt, decrypt } from "../lib/crypto";

export function useDisappear(userId, inviteCode) {
  const [myStatus, setMyStatus] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchMyStatus();
  }, [userId]);

  const fetchMyStatus = async () => {
    const { data } = await supabase
      .from("disappear_status")
      .select("*")
      .eq("user_id", userId)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (data) {
      data.status = await decrypt(data.status, inviteCode);
    }
    setMyStatus(data ?? null);
    setLoading(false);
  };

  // Fetch status for all members in a circle
  const fetchCircleStatuses = async (circleId) => {
    const { data: members } = await supabase
      .from("circle_members")
      .select("user_id")
      .eq("circle_id", circleId);

    if (!members?.length) return [];

    const ids = members.map((m) => m.user_id);
    const { data } = await supabase
      .from("disappear_status")
      .select("*, profile:profiles(name)")
      .in("user_id", ids)
      .gt("expires_at", new Date().toISOString());

    if (!data) return [];
    return Promise.all(
      data.map(async (d) => ({ ...d, status: await decrypt(d.status, inviteCode) }))
    );
  };

  const setDisappear = async (status, durationHours) => {
    const expires_at   = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();
    const encStatus    = await encrypt(status, inviteCode);

    const { data, error } = await supabase
      .from("disappear_status")
      .upsert({ user_id: userId, status: encStatus, expires_at }, { onConflict: "user_id" })
      .select()
      .single();

    if (error) throw error;
    setMyStatus({ ...data, status });
    return { ...data, status };
  };

  const clearDisappear = async () => {
    await supabase.from("disappear_status").delete().eq("user_id", userId);
    setMyStatus(null);
  };

  return { myStatus, loading, setDisappear, clearDisappear, fetchCircleStatuses };
}
