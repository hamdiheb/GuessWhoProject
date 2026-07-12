import { supabase } from "../config/supabase.js";

export async function createGameInDB(gameData) {
  return await supabase.from("game").insert([gameData]).select().single();
}

export async function getGameByIdInDB(gameId) {
  return await supabase
    .from("game")
    .select("game_name, game_questions, joined_users")
    .eq("id", gameId)
    .single();
}

export async function getGameByCodeInDB(gameCode) {
  return await supabase
    .from("game")
    .select("id, game_name, game_code, joined_users")
    .eq("game_code", gameCode)
    .single();
}

export async function updateJoinedUsersInDB(gameId, users) {
  return await supabase
    .from("game")
    .update({ joined_users: users })
    .eq("id", gameId)
    .select()
    .single();
}

export async function updateQuestionsInDB(gameId, newList) {
  return await supabase
    .from("game")
    .update({ game_questions: newList })
    .eq("id", gameId);
}

export async function getUsersByIds(userIds) {
  return await supabase
    .from("users")
    .select("username")
    .in("id", userIds);
}
