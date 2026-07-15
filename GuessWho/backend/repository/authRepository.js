import { supabase } from '../config/supabase.js'

export async function signIn(email, password) {
  return await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .eq('password', password)
    .single()
}

export async function getUserByEmail(email) {
  return await supabase.from('users').select('id').eq('email', email).single()
}

export async function signUp(username, email, password) {
  return await supabase
    .from('users')
    .insert({
      username,
      email,
      password,
    })
    .select('id')
    .single()
}
