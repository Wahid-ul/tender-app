import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useCatGame(circleId, userId) {
  const [game,    setGame]    = useState(null);
  const [votes,   setVotes]   = useState([]);
  const [members, setMembers] = useState([]);
  const [myVote,  setMyVote]  = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    const { data } = await supabase
      .from("circle_members")
      .select("profile:profiles(id, name)")
      .eq("circle_id", circleId);
    if (data) setMembers(data.map((d) => d.profile));
  }, [circleId]);

  const fetchVotes = useCallback(async (gameId, promptIndex) => {
    const { data } = await supabase
      .from("cat_votes")
      .select("voter_id, voted_for")
      .eq("game_id",      gameId)
      .eq("prompt_index", promptIndex);

    const rows = data ?? [];
    setVotes(rows);
    setMyVote(rows.find((v) => v.voter_id === userId)?.voted_for ?? null);
  }, [userId]);

  const fetchGame = useCallback(async () => {
    setLoading(true);

    let { data } = await supabase
      .from("cat_games")
      .select("*")
      .eq("circle_id", circleId)
      .maybeSingle();

    if (!data) {
      const { data: created } = await supabase
        .from("cat_games")
        .insert({ circle_id: circleId, prompt_index: 0 })
        .select()
        .single();
      data = created;
    }

    if (data) {
      setGame(data);
      await fetchVotes(data.id, data.prompt_index);
    }
    setLoading(false);
  }, [circleId, fetchVotes]);

  useEffect(() => {
    if (!circleId) return;
    fetchGame();
    fetchMembers();
  }, [circleId, fetchGame, fetchMembers]);

  const vote = async (votedForId) => {
    if (!game) return;
    const { error } = await supabase
      .from("cat_votes")
      .upsert(
        { game_id: game.id, voter_id: userId, voted_for: votedForId, prompt_index: game.prompt_index },
        { onConflict: "game_id,voter_id,prompt_index" }
      );
    if (!error) await fetchVotes(game.id, game.prompt_index);
  };

  const nextRound = async () => {
    if (!game) return;
    const { data } = await supabase
      .from("cat_games")
      .update({ prompt_index: game.prompt_index + 1 })
      .eq("id", game.id)
      .select()
      .single();
    if (data) {
      setGame(data);
      setVotes([]);
      setMyVote(null);
    }
  };

  return { game, votes, members, myVote, loading, vote, nextRound };
}
