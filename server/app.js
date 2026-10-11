import express from 'express'
import cors from 'cors'
const courseSelect = "SELECT c.id,c.course_code,c.course_name,c.target_grade,c.created_at,COALESCE((SELECT json_agg(json_build_object('id',cw.id,'category_name',cw.category_name,'weight_percentage',cw.weight_percentage,'is_complete',cw.is_complete,'assessments',COALESCE((SELECT json_agg(json_build_object('id',a.id,'item_name',a.item_name,'score',a.score,'max_score',a.max_score) ORDER BY a.created_at DESC) FROM assessment_scores a WHERE a.category_id=cw.id),'[]'::json)) ORDER BY cw.id) FROM category_weights cw WHERE cw.course_id=c.id),'[]'::json) AS categories FROM courses c"
const validNumber=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max
const clean=(v,max)=>typeof v==='string'&&v.trim().length>0&&v.trim().length<=max?v.trim():null
const route=fn=>(req,res,next)=>Promise.resolve().then(()=>fn(req,res)).catch(next)
export function createApp({pool,verifyToken,allowedOrigins=[]}){
 const app=express()
 app.disable('x-powered-by')
 app.use(cors({origin(origin,cb){if(!origin||allowedOrigins.includes(origin)||/^http:\/\/localhost:\d+$/.test(origin))return cb(null,true);const e=Error('Origin is not allowed.');e.status=403;cb(e)}}))
 app.use(express.json({limit:'100kb'}))
 app.get('/healthz',(_req,res)=>res.json({ok:true,service:'GradePulse API'}))
 app.get('/readyz',route(async(_req,res)=>{try{await pool.query('SELECT user_id FROM courses LIMIT 0');await pool.query('SELECT is_complete FROM category_weights LIMIT 0');res.json({ok:true,database:'connected'})}catch{res.status(503).json({ok:false,database:'unavailable',error:'Check the database connection and run auth-mobile.sql.'})}}))
 app.use('/api',(req,res,next)=>Promise.resolve().then(async()=>{
  const match=/^Bearer\s+(\S+)$/i.exec(req.get('authorization')||'')
  if(!match)return res.status(401).json({error:'Please log in to access your workspace.'})
  const user=await verifyToken(match[1])
  if(!user?.id)return res.status(401).json({error:'Your session is invalid or expired. Please log in again.'})
  req.user=user;next()
 }).catch(next))
 app.param('id',(req,res,next,id)=>/^[1-9]\d*$/.test(id)&&BigInt(id)<=9223372036854775807n?next():res.status(400).json({error:'Invalid record ID.'}))
 app.get('/api/courses',route(async(req,res)=>{const {rows}=await pool.query(courseSelect+' WHERE c.user_id=$1 ORDER BY c.created_at DESC',[req.user.id]);res.json(rows)}))
 app.post('/api/courses',route(async(req,res)=>{
  const code=clean(req.body?.course_code,30),name=clean(req.body?.course_name,120),target=req.body?.target_grade
  if(!code||!name||!validNumber(target,0,100))return res.status(400).json({error:'Enter a course code/name and a target between 0 and 100.'})
  const {rows}=await pool.query('INSERT INTO courses(course_code,course_name,target_grade,user_id) VALUES($1,$2,$3,$4) RETURNING *',[code.toUpperCase(),name,target,req.user.id])
  res.status(201).json({...rows[0],categories:[]})
 }))
 app.get('/api/courses/:id',route(async(req,res)=>{const {rows}=await pool.query(courseSelect+' WHERE c.id=$1 AND c.user_id=$2',[req.params.id,req.user.id]);if(!rows.length)return res.status(404).json({error:'Course not found.'});res.json(rows[0])}))
 app.delete('/api/courses/:id',route(async(req,res)=>{const r=await pool.query('DELETE FROM courses WHERE id=$1 AND user_id=$2',[req.params.id,req.user.id]);if(!r.rowCount)return res.status(404).json({error:'Course not found.'});res.status(204).end()}))
 app.patch('/api/courses/:id',route(async(req,res)=>{
  const target=req.body?.target_grade;if(!validNumber(target,0,100))return res.status(400).json({error:'Target must be between 0 and 100.'})
  const {rows}=await pool.query('UPDATE courses SET target_grade=$1 WHERE id=$2 AND user_id=$3 RETURNING *',[target,req.params.id,req.user.id])
  if(!rows.length)return res.status(404).json({error:'Course not found.'});res.json(rows[0])
 }))
 app.post('/api/courses/:id/categories',route(async(req,res)=>{
  const name=clean(req.body?.category_name,80),weight=req.body?.weight_percentage
  if(!name||!validNumber(weight,0.01,100))return res.status(400).json({error:'Enter a category name and weight from 0.01 to 100.'})
  const client=await pool.connect()
  try{
   await client.query('BEGIN')
   const course=await client.query('SELECT id FROM courses WHERE id=$1 AND user_id=$2 FOR UPDATE',[req.params.id,req.user.id])
   if(!course.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'Course not found.'})}
   const total=await client.query('SELECT COALESCE(SUM(weight_percentage),0) AS total FROM category_weights WHERE course_id=$1',[req.params.id])
   if(Number(total.rows[0].total)+weight>100.00001){await client.query('ROLLBACK');return res.status(400).json({error:'Category weights cannot exceed 100%.'})}
   const {rows}=await client.query('INSERT INTO category_weights(course_id,category_name,weight_percentage) VALUES($1,$2,$3) RETURNING *',[req.params.id,name,weight])
   await client.query('COMMIT');res.status(201).json({...rows[0],assessments:[]})
  }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
 }))
 app.patch('/api/categories/:id',route(async(req,res)=>{
  if(typeof req.body?.is_complete!=='boolean')return res.status(400).json({error:'Completion must be true or false.'})
  const {rows}=await pool.query('UPDATE category_weights cw SET is_complete=$1 FROM courses c WHERE cw.id=$2 AND c.id=cw.course_id AND c.user_id=$3 AND ($1=FALSE OR EXISTS(SELECT 1 FROM assessment_scores a WHERE a.category_id=cw.id)) RETURNING cw.*',[req.body.is_complete,req.params.id,req.user.id])
  if(!rows.length)return res.status(400).json({error:'Category not found or empty. Record a score before marking it complete.'})
  res.json(rows[0])
 }))
 app.post('/api/categories/:id/assessments',route(async(req,res)=>{
  const name=clean(req.body?.item_name,100),score=req.body?.score,max=req.body?.max_score
  if(!name||!validNumber(max,0.01,999999.99)||!validNumber(score,0,max))return res.status(400).json({error:'Enter valid points: earned must be between zero and possible points.'})
  const client=await pool.connect()
  try{
   await client.query('BEGIN')
   const owned=await client.query('SELECT cw.id FROM category_weights cw JOIN courses c ON c.id=cw.course_id WHERE cw.id=$1 AND c.user_id=$2 FOR UPDATE OF cw',[req.params.id,req.user.id])
   if(!owned.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'Category not found.'})}
   const {rows}=await client.query('INSERT INTO assessment_scores(category_id,item_name,score,max_score) VALUES($1,$2,$3,$4) RETURNING *',[req.params.id,name,score,max])
   await client.query('UPDATE category_weights SET is_complete=FALSE WHERE id=$1',[req.params.id])
   await client.query('COMMIT');res.status(201).json(rows[0])
  }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
 }))
 app.delete('/api/assessments/:id',route(async(req,res)=>{
  const client=await pool.connect()
  try{
   await client.query('BEGIN')
   const owned=await client.query('SELECT a.category_id FROM assessment_scores a JOIN category_weights cw ON cw.id=a.category_id JOIN courses c ON c.id=cw.course_id WHERE a.id=$1 AND c.user_id=$2 FOR UPDATE OF cw',[req.params.id,req.user.id])
   if(!owned.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'Assessment not found.'})}
   await client.query('DELETE FROM assessment_scores WHERE id=$1',[req.params.id])
   await client.query('UPDATE category_weights SET is_complete=FALSE WHERE id=$1',[owned.rows[0].category_id])
   await client.query('COMMIT');res.status(204).end()
  }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
 }))
 app.use((_req,res)=>res.status(404).json({error:'Route not found.'}))
 app.use((error,_req,res,_next)=>{
  console.error('API error:',error.message)
  const status=error.status||500
  res.status(status).json({error:status===401?'Please log in again.':status===503?'Authentication is temporarily unavailable. Please retry.':status===403?'Origin is not allowed.':status===400?'Invalid request.':'Unexpected server error. Check the server logs.'})
 })
 return app
}
