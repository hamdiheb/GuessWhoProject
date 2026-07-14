import { supabase } from "../config/supabase.js";

export async function getUserById(userId) {
  return await supabase.from("users").select("*").eq("id", userId).single();
}
