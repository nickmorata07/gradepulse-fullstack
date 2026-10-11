import {useEffect,useState} from 'react'
import {supabase,authConfigured,authRedirect} from '../supabase'
export default function AuthGate({children}){
 const [session,setSession]=useState(null),[ready,setReady]=useState(false),[recovery,setRecovery]=useState(false),[bootError,setBootError]=useState('')
 useEffect(()=>{
  if(!supabase){setReady(true);return}
  let alive=true
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event,next)=>{if(alive){setSession(next);setReady(true);if(event==='PASSWORD_RECOVERY')setRecovery(true);if(event==='SIGNED_OUT')setRecovery(false)}})
  supabase.auth.getSession().then(({data,error})=>{if(alive){if(error)setBootError(error.message);setSession(data.session);setReady(true)}}).catch(e=>{if(alive){setBootError(e.message);setReady(true)}})
  return()=>{alive=false;subscription.unsubscribe()}
 },[])
 if(!ready)return <div className="auth-loading"><div className="spinner"/><p>Opening your workspace…</p></div>
 if(!authConfigured)return <AuthLayout><div className="eyebrow">ONE-TIME SETUP</div><h1>Your workspace is almost ready.</h1><p className="auth-subtitle">Add your Supabase project URL and public publishable key to client/.env, then restart Vite.</p><p className="auth-subtitle">The exact steps are in START-HERE.md included with your update.</p></AuthLayout>
 if(recovery&&session)return <PasswordRecovery onDone={()=>setRecovery(false)}/>
 if(session)return children({user:session.user,signOut:()=>supabase.auth.signOut({scope:'local'})})
 return <AuthForm bootError={bootError}/>
}
function AuthLayout({children}){
 return <main className="auth-page"><section className="auth-story"><a className="auth-brand" href="#home"><span className="auth-logo">▥</span> grade<span>pulse</span></a><div className="auth-story-body"><div className="auth-pill">✦ A little clarity. A lot of possibility.</div><h2>Your next chapter<br/>starts with<br/><span>a clearer plan.</span></h2><p>One place for your courses, your progress,<br/>and the grades you’re working toward.</p><div className="auth-preview"><div className="auth-preview-header"><span>YOUR SEMESTER, IN FOCUS</span><span>↗</span></div><div className="auth-preview-bars"><i/><i/><i/><i/><i/><i/><i/></div><div className="auth-preview-footer"><strong>Small steps. Big progress.</strong><span>Every assessment counts.</span></div></div></div><span className="auth-story-footer">Made for learning. Designed around you.</span></section><section className="auth-form-side"><div className="auth-mobile-brand">▥ grade<span>pulse</span></div><div className="auth-card">{children}</div><p className="auth-bottom-note">Your goals, your grades, your own workspace.</p></section></main>
}
function AuthForm({bootError}){
 const [mode,setMode]=useState('login'),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[displayName,setDisplayName]=useState(''),[visible,setVisible]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(bootError),[notice,setNotice]=useState('')
 function change(next){setMode(next);setError('');setNotice('');setPassword('')}
 async function submit(e){
  e.preventDefault();setBusy(true);setError('');setNotice('')
  try{
   if(mode==='reset'){const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:authRedirect()});if(error)throw error;setNotice('If this email has an account, a password-reset link will arrive shortly.');return}
   if(mode==='signup'){
    const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{data:{display_name:displayName.trim()},emailRedirectTo:authRedirect()}})
    if(error)throw error
    if(!data.session){setNotice('Check your email to confirm your account, then return here to log in.');setPassword('')}
   }else{const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(error)throw error}
  }catch(e){setError(e.message||'Unable to sign in. Please try again.')}finally{setBusy(false)}
 }
 return <AuthLayout><div className="eyebrow">YOUR PERSONAL GRADE WORKSPACE</div><h1>{mode==='signup'?'A fresh start.':mode==='reset'?'Let’s get you back in.':'Welcome back.'}</h1><p className="auth-subtitle">{mode==='signup'?'Create an account and make room for your goals.':mode==='reset'?'We’ll send a link so you can choose a new password.':'Your progress is waiting. Pick up where you left off.'}</p>
 {mode!=='reset'&&<div className="auth-tabs" aria-label="Account access"><button type="button" className={mode==='login'?'active':''} onClick={()=>change('login')} disabled={busy}>Log in</button><button type="button" className={mode==='signup'?'active':''} onClick={()=>change('signup')} disabled={busy}>Create account</button></div>}
 {error&&<p className="auth-message error" role="alert">{error}</p>}{notice&&<p className="auth-message success" role="status">{notice}</p>}
 <form className="auth-form" onSubmit={submit}>{mode==='signup'&&<label>What should we call you?<input autoComplete="name" value={displayName} onChange={e=>setDisplayName(e.target.value)} maxLength="60" placeholder="Your name" required/></label>}<label>Email address<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" maxLength="254" required/></label>
 {mode!=='reset'&&<label>Password<div className="auth-password"><input type={visible?'text':'password'} autoComplete={mode==='signup'?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} minLength={mode==='signup'?8:1} required placeholder={mode==='signup'?'At least 8 characters':'Enter your password'}/><button type="button" onClick={()=>setVisible(!visible)} aria-label={visible?'Hide password':'Show password'}>{visible?'Hide':'Show'}</button></div></label>}
 {mode==='login'&&<button className="auth-forgot" type="button" onClick={()=>change('reset')}>Forgot password?</button>}
 <button className="button button-primary auth-submit" disabled={busy}>{busy?'One moment…':mode==='signup'?'Create my workspace →':mode==='reset'?'Send reset link →':'Log in to GradePulse →'}</button></form>
 {mode==='reset'?<button className="auth-back" onClick={()=>change('login')}>← Back to login</button>:<p className="auth-switch">{mode==='login'?'New to GradePulse?':'Already have an account?'} <button type="button" onClick={()=>change(mode==='login'?'signup':'login')}>{mode==='login'?'Create an account':'Log in'}</button></p>}
 </AuthLayout>
}
function PasswordRecovery({onDone}){
 const [password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('')
 return <AuthLayout><div className="eyebrow">A FRESH START</div><h1>Choose a new password.</h1><p className="auth-subtitle">Use at least eight characters.</p>{error&&<p className="auth-message error" role="alert">{error}</p>}<form className="auth-form" onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try{const {error}=await supabase.auth.updateUser({password});if(error)throw error;onDone()}catch(e){setError(e.message)}finally{setBusy(false)}}}><label>New password<input type="password" autoComplete="new-password" minLength="8" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="button button-primary auth-submit" disabled={busy}>{busy?'Saving…':'Save password'}</button></form></AuthLayout>
}
