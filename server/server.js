import {createClient} from '@supabase/supabase-js'
import {pool} from './db/pool.js'
import {createApp} from './app.js'
// db/pool.js loads your existing server/.env before these values are read.
const url=process.env.SUPABASE_URL
const key=process.env.SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_ANON_KEY
if(!url||!key){console.error('Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY to server/.env. Keep DATABASE_URL unchanged.');process.exit(1)}
const auth=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})
const allowedOrigins=(process.env.CORS_ORIGINS||'http://localhost:5173,http://localhost:5174').split(',').map(s=>s.trim()).filter(Boolean)
const app=createApp({pool,allowedOrigins,verifyToken:async token=>{
 const {data,error}=await auth.auth.getUser(token)
 if(error){if(!error.status||error.status>=500){const e=Error('Auth verification unavailable');e.status=503;throw e}return null}
 return data.user
}})
const port=Number(process.env.PORT)||5000
const server=app.listen(port,()=>console.log('GradePulse API listening on http://localhost:'+port))
server.on('error',e=>{if(e.code==='EADDRINUSE')console.error('Port '+port+' is already in use. Stop the previous GradePulse backend before starting another.');else console.error(e.message);process.exit(1)})
function shutdown(){server.close(async()=>{await pool.end();process.exit(0)})}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown)
