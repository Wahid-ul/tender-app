import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useCircle(userId) {
  const [circle,  setCircle]  = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchCircle();
  }, [userId]);

  const fetchCircle = async () => {
    setLoading(true);
    // Get the first circle this user belongs to
    const { data, error } = await supabase
      .from("circle_members")
      .select(`circle:circles(*, created_by)`)
      .eq("user_id", userId)
      .limit(1)
      .single();

    if (!error && data?.circle) {
      setCircle(data.circle);
      await fetchMembers(data.circle.id);
    }
    setLoading(false);
  };

  const fetchMembers = async (circleId) => {
    const { data } = await supabase
      .from("circle_members")
      .select(`profile:profiles(id, name, avatar_url)`)
      .eq("circle_id", circleId);

    if (data) setMembers(data.map((d) => d.profile));
  };

  const createCircle = async (name, userId) => {
    // Create the circle
    const { data: circleData, error: circleErr } = await supabase
      .from("circles")
      .insert({ name, created_by: userId })
      .select()
      .single();

    if (circleErr) throw circleErr;

    // Add creator as first member
    const { error: memberErr } = await supabase
      .from("circle_members")
      .insert({ circle_id: circleData.id, user_id: userId });

    if (memberErr) throw memberErr;

    setCircle(circleData);
    await fetchMembers(circleData.id);
    return circleData;
  };

  const joinCircle = async (inviteCode, userId) => {
    // Find circle by invite code
    const { data: circleData, error: findErr } = await supabase
      .from("circles")
      .select("*")
      .eq("invite_code", inviteCode.trim().toLowerCase())
      .single();

    if (findErr || !circleData) throw new Error("Invite code not found. Check and try again.");

    // Check member limit (max 10)
    const { count } = await supabase
      .from("circle_members")
      .select("*", { count: "exact", head: true })
      .eq("circle_id", circleData.id);

    if (count >= 10) throw new Error("This circle is full (max 10 people).");

    // Check if already a member
    const { data: existing } = await supabase
      .from("circle_members")
      .select("user_id")
      .eq("circle_id", circleData.id)
      .eq("user_id", userId)
      .single();

    if (existing) throw new Error("You're already in this circle.");

    // Join
    const { error: joinErr } = await supabase
      .from("circle_members")
      .insert({ circle_id: circleData.id, user_id: userId });

    if (joinErr) throw joinErr;

    setCircle(circleData);
    await fetchMembers(circleData.id);
    return circleData;
  };

  return { circle, members, loading, createCircle, joinCircle, refetch: fetchCircle };
}
