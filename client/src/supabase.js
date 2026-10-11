import {createClient} from '@supabase/supabase-js'
const url=import.meta.env.VITE_SUPABASE_URL?.trim()
const key=(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY)?.trim()
let valid=false
try{valid=!!key && new URL(url).protocol==='https:' && !key.startsWith('sb_secret_')}catch{}
export const authConfigured=valid
export const supabase=valid?createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null
export const authRedirect=()=>window.location.origin+import.meta.env.BASE_URL
