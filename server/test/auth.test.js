import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {PGlite} from '@electric-sql/pglite'
import {createApp} from '../app.js'
const alice='00000000-0000-4000-8000-000000000001'
const bob='00000000-0000-4000-8000-000000000002'
test('authenticated API and SQL policies isolate users while preserving legacy data',async()=>{
 const db=new PGlite()
 const fixture=await readFile(new URL('./fixture.sql',import.meta.url),'utf8')
 await db.exec(fixture.replaceAll('USER_ALICE',alice).replaceAll('USER_BOB',bob))
 const migration=await readFile(new URL('../db/auth-mobile.sql',import.meta.url),'utf8')
 await db.exec(migration);await db.exec(migration)
 const query=async(sql,args=[])=>{const r=await db.query(sql,args);return {...r,rowCount:/^\s*(SELECT|WITH)/i.test(sql)?r.rows.length:(r.affectedRows??r.rows.length)}}
 const pool={query,connect:async()=>({query,release(){}})}
 const app=createApp({pool,verifyToken:async t=>t==='alice'?{id:alice}:t==='bob'?{id:bob}:null})
 const server=app.listen(0,'127.0.0.1')
 await new Promise(resolve=>server.once('listening',resolve))
 const base='http://127.0.0.1:'+server.address().port
 async function request(path,token,method='GET',body){
  const response=await fetch(base+path,{method,headers:{...(token?{Authorization:'Bearer '+token}:{}),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})})
  return {status:response.status,data:response.status===204?null:await response.json()}
 }
 try{
  assert.equal((await request('/api/courses')).status,401)
  assert.equal((await request('/api/courses','forged')).status,401)
  assert.deepEqual((await request('/api/courses','alice')).data,[])
  const created=await request('/api/courses','alice','POST',{course_code:'CS-101',course_name:'Programming',target_grade:90,user_id:bob})
  assert.equal(created.status,201);assert.equal(created.data.user_id,alice)
  const id=created.data.id
  assert.equal((await request('/api/courses/'+id,'bob')).status,404)
  assert.equal((await request('/api/courses/'+id,'bob','PATCH',{target_grade:50})).status,404)
  assert.equal((await request('/api/courses/'+id,'bob','DELETE')).status,404)
  assert.equal((await request('/api/courses/'+id+'/categories','bob','POST',{category_name:'Exams',weight_percentage:100})).status,404)
  const category=await request('/api/courses/'+id+'/categories','alice','POST',{category_name:'Exams',weight_percentage:100})
  assert.equal(category.status,201)
  const cid=category.data.id
  assert.equal((await request('/api/categories/'+cid+'/assessments','bob','POST',{item_name:'Attack',score:100,max_score:100})).status,404)
  assert.equal((await request('/api/categories/'+cid,'bob','PATCH',{is_complete:true})).status,400)
  assert.equal((await request('/api/categories/'+cid+'/assessments','alice','POST',{item_name:'Invalid',score:101,max_score:100})).status,400)
  const score=await request('/api/categories/'+cid+'/assessments','alice','POST',{item_name:'Quiz',score:18,max_score:20})
  assert.equal(score.status,201)
  assert.equal((await request('/api/categories/'+cid,'alice','PATCH',{is_complete:true})).status,200)
  const loaded=await request('/api/courses/'+id,'alice')
  assert.equal(loaded.data.categories[0].is_complete,true);assert.equal(loaded.data.categories[0].assessments.length,1)
  assert.equal((await request('/api/assessments/'+score.data.id,'bob','DELETE')).status,404)
  assert.equal((await request('/api/assessments/'+score.data.id,'alice','DELETE')).status,204)
  assert.equal((await request('/api/courses/'+id,'alice')).data.categories[0].is_complete,false)
  assert.equal((await request('/api/courses/invalid','alice')).status,400)
  assert.deepEqual((await request('/api/courses','bob')).data,[])
  const preserved=await query("SELECT course_code,user_id FROM courses WHERE course_code='LEGACY'")
  assert.equal(preserved.rows.length,1);assert.equal(preserved.rows[0].user_id,null)
  await db.exec("GRANT USAGE ON SCHEMA public,auth TO authenticated; GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated")
  await query("SELECT set_config('request.jwt.claim.sub',$1,false)",[bob]);await db.exec('SET ROLE authenticated')
  assert.equal((await query('SELECT * FROM courses')).rows.length,0)
  assert.equal((await query('SELECT * FROM category_weights')).rows.length,0)
  await db.exec('RESET ROLE');await query("SELECT set_config('request.jwt.claim.sub',$1,false)",[alice]);await db.exec('SET ROLE authenticated')
  assert.equal((await query('SELECT * FROM courses')).rows.length,1)
  assert.equal((await query('SELECT * FROM category_weights')).rows.length,1)
  await db.exec('RESET ROLE')
 }finally{await new Promise(resolve=>server.close(resolve));await db.close()}
})
