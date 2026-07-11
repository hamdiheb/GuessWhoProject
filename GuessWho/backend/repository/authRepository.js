import { supabase } from "../config/supabase.js";

export async function signIn(email, password) {
  return await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .eq("password", password)
    .single();
}