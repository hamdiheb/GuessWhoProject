import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pacytunlhrcrbcrjnnvh.supabase.co'
const supabaseKey = 'sb_publishable_bAki4Hu7w-DB97Je_8xcbQ_jyrzsDVl'

export const supabase = createClient(supabaseUrl, supabaseKey)
