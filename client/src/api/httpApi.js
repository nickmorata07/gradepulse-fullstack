import {supabase} from '../supabase'
let BASE=(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/,'')
// Vite proxies /api to Express. Use it for localhost and phone-on-Wi-Fi requests.
if(import.meta.env.DEV){try{const h=new URL(BASE).hostname;if(['localhost','127.0.0.1','[::1]'].includes(h))BASE=''}catch{}}
async function request(path,options={}){
 if(!supabase)throw Error('Supabase login is not configured. Follow START-HERE.md.')
 const {data,error}=await supabase.auth.getSession()
 if(error)throw error
 if(!data.session)throw Error('Please log in again.')
 const response=await fetch(BASE+path,{...options,headers:{'Content-Type':'application/json',...options.headers,Authorization:'Bearer '+data.session.access_token}})
 if(!response.ok){let message='Request failed ('+response.status+').';try{message=(await response.json()).error||message}catch{}throw Error(message)}
 return response.status===204?null:response.json()
}
export const listCourses=()=>request('/api/courses')
export const createCourse=data=>request('/api/courses',{method:'POST',body:JSON.stringify(data)})
export const getCourse=id=>request('/api/courses/'+id)
export const deleteCourse=id=>request('/api/courses/'+id,{method:'DELETE'})
export const createCategory=(id,data)=>request('/api/courses/'+id+'/categories',{method:'POST',body:JSON.stringify(data)})
export const createAssessment=(id,data)=>request('/api/categories/'+id+'/assessments',{method:'POST',body:JSON.stringify(data)})
export const updateTarget=(id,data)=>request('/api/courses/'+id,{method:'PATCH',body:JSON.stringify(data)})
export const updateCompletion=(id,data)=>request('/api/categories/'+id,{method:'PATCH',body:JSON.stringify(data)})
export const deleteAssessment=id=>request('/api/assessments/'+id,{method:'DELETE'})
