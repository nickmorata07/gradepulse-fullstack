import { useCallback, useEffect, useMemo, useState } from 'react'
import { USING_MOCK_API, listCourses, createCourse, getCourse, deleteCourse, createCategory, createAssessment } from './api'
import DemoNotice from './components/DemoNotice'

const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
const percent = (value) => `${Number(value || 0).toFixed(1)}%`
function categoryAverage(category) {
  const assessments = category.assessments || []
  if (!assessments.length) return null
  const possible = assessments.reduce((sum, item) => sum + Number(item.max_score), 0)
  return possible ? assessments.reduce((sum, item) => sum + Number(item.score), 0) / possible * 100 : null
}
function courseProgress(course) {
  const categories = course.categories || []
  const graded = categories.filter((category) => categoryAverage(category) !== null)
  if (!graded.length) return null
  const weight = graded.reduce((sum, category) => sum + Number(category.weight_percentage), 0)
  return weight ? graded.reduce((sum, category) => sum + categoryAverage(category) * Number(category.weight_percentage), 0) / weight : null
}
function forecast(course) {
  const categories = course.categories || []
  const graded = categories.filter((category) => categoryAverage(category) !== null)
  const completedWeight = graded.reduce((sum, category) => sum + Number(category.weight_percentage), 0)
  const earned = graded.reduce((sum, category) => sum + categoryAverage(category) * Number(category.weight_percentage) / 100, 0)
  const remaining = Math.max(0, 100 - completedWeight)
  if (remaining === 0) return { remaining, required: null, current: earned }
  return { remaining, required: (Number(course.target_grade) - earned) / (remaining / 100), current: earned }
}

export default function App() {
  const [courses, setCourses] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [activeView, setActiveView] = useState('overview')
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [courseCode, setCourseCode] = useState('')
  const [courseName, setCourseName] = useState('')
  const [targetGrade, setTargetGrade] = useState('90')
  const [saving, setSaving] = useState(false)
  const [categoryCourseId, setCategoryCourseId] = useState(null)
  const [categoryName, setCategoryName] = useState('')
  const [categoryWeight, setCategoryWeight] = useState('20')
  const [assessmentCategoryId, setAssessmentCategoryId] = useState(null)
  const [assessmentName, setAssessmentName] = useState('')
  const [assessmentScore, setAssessmentScore] = useState('')
  const [assessmentMax, setAssessmentMax] = useState('100')

  const refresh = useCallback(async (preferredId) => {
    setLoading(true); setError('')
    try {
      const rows = await listCourses()
      setCourses(rows)
      setSelectedId((current) => {
        const wanted = preferredId ?? current
        return rows.some((course) => String(course.id) === String(wanted)) ? wanted : (rows[0]?.id ?? null)
      })
    } catch (err) { setError(err.message || 'Unable to load courses.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { refresh() }, [refresh])

  const selected = courses.find((course) => String(course.id) === String(selectedId)) || null
  const filteredCourses = useMemo(() => courses.filter((course) => `${course.course_code} ${course.course_name}`.toLowerCase().includes(search.toLowerCase())), [courses, search])
  const allCategories = courses.flatMap((course) => course.categories || [])
  const assessedCount = allCategories.reduce((sum, category) => sum + (category.assessments || []).length, 0)
  const averages = courses.map(courseProgress).filter((value) => value !== null)
  const overallAverage = averages.length ? averages.reduce((sum, value) => sum + value, 0) / averages.length : null

  async function submitCourse(event) {
    event.preventDefault(); setError(''); setNotice('')
    if (!courseCode.trim() || !courseName.trim()) { setError('Enter both a course code and course name.'); return }
    if (Number(targetGrade) < 0 || Number(targetGrade) > 100) { setError('Target grade must be between 0 and 100.'); return }
    setSaving(true)
    try {
      const created = await createCourse({ course_code: courseCode, course_name: courseName, target_grade: Number(targetGrade) })
      setCourseCode(''); setCourseName(''); setTargetGrade('90'); setShowCourseForm(false); setActiveView('overview'); setNotice('Course added successfully.')
      await refresh(created.id)
    } catch (err) { setError(err.message || 'Could not create course.') }
    finally { setSaving(false) }
  }
  async function removeCourse(course) {
    if (!window.confirm(`Delete ${course.course_code} — ${course.course_name}? This cannot be undone.`)) return
    try { await deleteCourse(course.id); setNotice('Course deleted.'); await refresh() }
    catch (err) { setError(err.message || 'Could not delete course.') }
  }
  async function submitCategory(event) {
    event.preventDefault(); if (!selected) return
    const existing = (selected.categories || []).reduce((sum, category) => sum + Number(category.weight_percentage), 0)
    if (Number(categoryWeight) <= 0 || existing + Number(categoryWeight) > 100) { setError(`Category weights must be positive and total no more than 100%. Current total: ${existing}%.`); return }
    try { await createCategory(selected.id, { category_name: categoryName, weight_percentage: Number(categoryWeight) }); setCategoryName(''); setCategoryWeight('20'); setCategoryCourseId(null); setNotice('Grade category added.'); await refresh(selected.id) }
    catch (err) { setError(err.message || 'Could not add category.') }
  }
  async function submitAssessment(event) {
    event.preventDefault()
    if (Number(assessmentMax) <= 0 || Number(assessmentScore) < 0 || Number(assessmentScore) > Number(assessmentMax)) { setError('Score must be between 0 and the maximum score.'); return }
    try { await createAssessment(assessmentCategoryId, { item_name: assessmentName, score: Number(assessmentScore), max_score: Number(assessmentMax) }); setAssessmentName(''); setAssessmentScore(''); setAssessmentMax('100'); setAssessmentCategoryId(null); setNotice('Assessment score saved.'); await refresh(selectedId) }
    catch (err) { setError(err.message || 'Could not save assessment.') }
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#top" onClick={() => setActiveView('overview')}><span className="brand-mark"><span className="brand-bars"><i/><i/><i/><i/></span></span><span>grade<span className="brand-light">pulse</span><small>STUDENT PERFORMANCE</small></span></a>
      <div className="workspace-label">WORKSPACE</div>
      <button className={`nav-link ${activeView === 'overview' ? 'active' : ''}`} onClick={() => setActiveView('overview')}><span className="nav-icon">◫</span> Overview</button>
      <button className={`nav-link ${activeView === 'courses' ? 'active' : ''}`} onClick={() => setActiveView('courses')}><span className="nav-icon">▤</span> My courses <span className="nav-count">{courses.length}</span></button>
      <button className={`nav-link ${activeView === 'forecaster' ? 'active' : ''}`} onClick={() => { setActiveView('forecaster'); if (!selectedId && courses[0]) setSelectedId(courses[0].id) }}><span className="nav-icon">↗</span> Grade forecaster</button>
      <div className="sidebar-bottom"><div className="sidebar-mini-card"><div className="mini-icon">✦</div><strong>Small steps. Big progress.</strong><p>Stay on top of every class and plan your next move.</p></div><div className="profile-row"><div className="avatar">GP</div><div><strong>Student workspace</strong><span>Academic dashboard</span></div><span className="profile-dots">•••</span></div></div>
    </aside>

    <main className="main-content" id="top">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>{activeView === 'overview' ? 'Overview' : activeView === 'courses' ? 'My courses' : 'Grade forecaster'}</strong></div><div className="topbar-right"><span className={`connection-pill ${USING_MOCK_API ? 'demo' : 'live'}`}><i/>{USING_MOCK_API ? 'Demo data' : 'Connected API'}</span><div className="top-avatar">GP</div></div></header>
      <div className="content-wrap">
        <DemoNotice />
        {error && <div className="alert alert-error" role="alert"><span>!</span><div>{error}</div><button onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}
        {notice && <div className="alert alert-success" role="status"><span>✓</span><div>{notice}</div><button onClick={() => setNotice('')} aria-label="Dismiss notice">×</button></div>}

        {activeView === 'overview' && <>
          <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-dot"/> YOUR ACADEMIC COMMAND CENTER</div><h1>Make your next grade<br/><span>your best one yet.</span></h1><p className="page-subtitle">A clearer view of your progress. A smarter plan for what's next.</p></div><button className="button button-primary" onClick={() => setShowCourseForm(true)}><span>＋</span> Add a course</button></section>
          <section className="stats-grid">
            <article className="stat-card"><div className="stat-top"><span>Enrolled courses</span><span className="stat-icon violet">▤</span></div><div className="stat-number">{loading ? '—' : courses.length.toString().padStart(2, '0')}</div><div className="stat-foot"><span className="stat-foot-dot violet-dot"/> Courses in your workspace</div></article>
            <article className="stat-card"><div className="stat-top"><span>Current average</span><span className="stat-icon green">↗</span></div><div className="stat-number">{loading ? '—' : overallAverage === null ? '—' : percent(overallAverage)}</div><div className="stat-foot"><span className="stat-foot-dot green-dot"/> Across courses with grades</div></article>
            <article className="stat-card"><div className="stat-top"><span>Assessments tracked</span><span className="stat-icon amber">▣</span></div><div className="stat-number">{loading ? '—' : assessedCount.toString().padStart(2, '0')}</div><div className="stat-foot"><span className="stat-foot-dot amber-dot"/> Scores recorded so far</div></article>
          </section>

          <section className="section-heading"><div><div className="eyebrow">YOUR LEARNING OVERVIEW</div><h2>Pick up where you left off</h2><p>Review a course, log a score, or see what it takes to reach your goal.</p></div><button className="text-button" onClick={() => setActiveView('courses')}>View all courses <span>→</span></button></section>
          <section className="course-grid">
            {loading ? <div className="empty-state"><div className="spinner"/><p>Getting your courses ready…</p></div> : courses.slice(0, 3).map((course, index) => <CourseCard key={course.id} course={course} index={index} onOpen={() => { setSelectedId(course.id); setActiveView('courses') }} onForecast={() => { setSelectedId(course.id); setActiveView('forecaster') }} />)}
            {!loading && courses.length === 0 && <div className="empty-state"><div className="empty-icon">＋</div><h3>Your semester starts here</h3><p>Add your first course to begin tracking your progress.</p><button className="button button-primary" onClick={() => setShowCourseForm(true)}>Add your first course</button></div>}
          </section>
          <section className="bottom-panel"><div className="bottom-illustration"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="sparkle">✦</div><div className="target-ring"><span>↗</span></div></div><div className="bottom-copy"><div className="eyebrow">A LITTLE CLARITY GOES A LONG WAY</div><h3>Your target isn't a guess anymore.</h3><p>Use the Grade Forecaster to estimate the average you need on remaining work to reach your target grade.</p></div><button className="button button-dark" onClick={() => setActiveView('forecaster')}>Open grade forecaster <span>→</span></button></section>
        </>}

        {activeView === 'courses' && <>
          <section className="page-title-row"><div><div className="eyebrow">YOUR SEMESTER, ORGANIZED</div><h1>My courses</h1><p className="page-subtitle">Everything you're working on, all in one place.</p></div><button className="button button-primary" onClick={() => setShowCourseForm(true)}>＋ Add a course</button></section>
          <div className="toolbar"><label className="search-box"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by course code or name…" aria-label="Search courses"/></label><span className="result-count">{filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}</span></div>
          {selected && <section className="detail-card"><div className="detail-header"><div className="course-avatar large">{initials(selected.course_code)}</div><div className="detail-title"><span className="course-code">{selected.course_code}</span><h2>{selected.course_name}</h2><span className="target-chip">Target grade · {percent(selected.target_grade)}</span></div><button className="button button-danger-outline" onClick={() => removeCourse(selected)}>Delete course</button></div><div className="detail-metrics"><div><span>Current average</span><strong>{courseProgress(selected) === null ? 'No scores yet' : percent(courseProgress(selected))}</strong></div><div><span>Grade categories</span><strong>{(selected.categories || []).length}</strong></div><div><span>Scores recorded</span><strong>{(selected.categories || []).reduce((sum, category) => sum + category.assessments.length, 0)}</strong></div></div><div className="detail-section-title"><div><h3>Grade breakdown</h3><p>Category weights should add up to 100%.</p></div><button className="button button-secondary" onClick={() => { setCategoryCourseId(selected.id); setError('') }}>＋ Add category</button></div>
            {(selected.categories || []).length === 0 ? <div className="inline-empty"><span>▤</span><div><strong>No grade categories yet</strong><p>Add categories such as quizzes, projects, and exams to organize scores.</p></div></div> : <div className="category-list">{selected.categories.map((category) => <div className="category-row" key={category.id}><div className="category-symbol">{category.category_name.toLowerCase().includes('exam') ? '✧' : category.category_name.toLowerCase().includes('project') ? '◇' : '▧'}</div><div className="category-info"><strong>{category.category_name}</strong><span>{category.assessments.length} {category.assessments.length === 1 ? 'assessment' : 'assessments'}</span></div><div className="category-progress"><div className="progress-track"><span style={{ width: `${categoryAverage(category) ?? 0}%` }}/></div><span>{categoryAverage(category) === null ? 'No score' : percent(categoryAverage(category))}</span></div><div className="weight-label">{category.weight_percentage}% weight</div><button className="icon-button" aria-label={`Add score to ${category.category_name}`} onClick={() => { setAssessmentCategoryId(category.id); setError('') }}>＋</button>{category.assessments.length > 0 && <div className="assessment-list">{category.assessments.map((assessment) => <div key={assessment.id}><span>{assessment.item_name}</span><strong>{assessment.score} / {assessment.max_score}</strong></div>)}</div>}</div>)}</div>}
          </section>}
          <section className="section-heading compact-heading"><div><div className="eyebrow">COURSE LIBRARY</div><h2>All courses</h2></div></section>
          <section className="course-grid">{loading ? <div className="empty-state"><div className="spinner"/><p>Loading courses…</p></div> : filteredCourses.map((course, index) => <CourseCard key={course.id} course={course} index={index} active={String(course.id) === String(selectedId)} onOpen={() => setSelectedId(course.id)} onForecast={() => { setSelectedId(course.id); setActiveView('forecaster') }} />)}{!loading && !filteredCourses.length && <div className="empty-state"><h3>No courses match that search</h3><p>Try another keyword or add a new course.</p></div>}</section>
        </>}

        {activeView === 'forecaster' && <>
          <section className="page-title-row"><div><div className="eyebrow">PLAN WITH PURPOSE</div><h1>Grade forecaster</h1><p className="page-subtitle">Turn your target into a plan you can work toward.</p></div></section>
          {courses.length > 0 && <label className="course-select-label">Choose a course<select value={selectedId ?? ''} onChange={(e) => setSelectedId(e.target.value)}>{courses.map((course) => <option key={course.id} value={course.id}>{course.course_code} — {course.course_name}</option>)}</select></label>}
          {!selected ? <div className="empty-state"><div className="empty-icon">↗</div><h3>Add a course to start forecasting</h3><p>Your forecast uses the target grade, category weights, and scores you record.</p><button className="button button-primary" onClick={() => setShowCourseForm(true)}>＋ Add a course</button></div> : <ForecastPanel course={selected} onOpenCourses={() => setActiveView('courses')} />}
        </>}
      </div>
      <footer className="app-footer"><span>© 2026 GradePulse</span><span>Built for better learning, one score at a time.</span><span className="footer-status"><i/> {USING_MOCK_API ? 'Browser demo' : 'API connected'}</span></footer>
    </main>

    {showCourseForm && <Modal title="Add a course" subtitle="Make space for your next academic goal." onClose={() => setShowCourseForm(false)}><form className="modal-form" onSubmit={submitCourse}><Field label="Course code"><input autoFocus value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="e.g. CS-401" maxLength="30" required/></Field><Field label="Course name"><input value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="e.g. Application and Systems Integration" maxLength="120" required/></Field><Field label="Target grade (%)"><input type="number" value={targetGrade} onChange={(e) => setTargetGrade(e.target.value)} min="0" max="100" step="0.5" required/></Field><div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setShowCourseForm(false)}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? 'Saving…' : 'Create course'}</button></div></form></Modal>}
    {categoryCourseId && <Modal title="Add grade category" subtitle="Define how this part of the course contributes to your grade." onClose={() => setCategoryCourseId(null)}><form className="modal-form" onSubmit={submitCategory}><Field label="Category name"><input autoFocus value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="e.g. Quizzes, Projects, Exams" maxLength="80" required/></Field><Field label="Weight (%)"><input type="number" value={categoryWeight} onChange={(e) => setCategoryWeight(e.target.value)} min="1" max="100" step="1" required/></Field><p className="form-hint">Existing category weights: {(selected?.categories || []).reduce((sum, item) => sum + Number(item.weight_percentage), 0)}%.</p><div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setCategoryCourseId(null)}>Cancel</button><button className="button button-primary">Add category</button></div></form></Modal>}
    {assessmentCategoryId && <Modal title="Record an assessment" subtitle="Enter the score you earned. You can add more assessments anytime." onClose={() => setAssessmentCategoryId(null)}><form className="modal-form" onSubmit={submitAssessment}><Field label="Assessment name"><input autoFocus value={assessmentName} onChange={(e) => setAssessmentName(e.target.value)} placeholder="e.g. Quiz 3" maxLength="100" required/></Field><div className="form-two-col"><Field label="Score earned"><input type="number" value={assessmentScore} onChange={(e) => setAssessmentScore(e.target.value)} min="0" step="0.01" placeholder="e.g. 18" required/></Field><Field label="Maximum score"><input type="number" value={assessmentMax} onChange={(e) => setAssessmentMax(e.target.value)} min="0.01" step="0.01" required/></Field></div><div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setAssessmentCategoryId(null)}>Cancel</button><button className="button button-primary">Save score</button></div></form></Modal>}
  </div>
}

function CourseCard({ course, index, onOpen, onForecast, active }) {
  const average = courseProgress(course)
  const palettes = ['lavender', 'mint', 'peach']
  return <article className={`course-card ${active ? 'selected-card' : ''}`}><div className="course-card-top"><div className={`course-avatar ${palettes[index % palettes.length]}`}>{initials(course.course_code)}</div><button className="card-menu" aria-label={`Open ${course.course_code}`} onClick={onOpen}>↗</button></div><div className="course-code">{course.course_code}</div><h3>{course.course_name}</h3><div className="course-card-meta"><span>Target grade</span><strong>{percent(course.target_grade)}</strong></div><div className="course-progress"><div className="progress-track"><span style={{ width: `${Math.min(100, average ?? 0)}%` }}/></div><span>{average === null ? 'No grades' : percent(average)}</span></div><div className="course-card-footer"><span>{(course.categories || []).length} categories · {(course.categories || []).reduce((sum, cat) => sum + cat.assessments.length, 0)} scores</span><button onClick={onForecast}>Forecast grade <span>→</span></button></div></article>
}
function ForecastPanel({ course, onOpenCourses }) {
  const result = forecast(course)
  const canForecast = (course.categories || []).length > 0
  const impossible = result.required !== null && result.required > 100
  return <div className="forecast-layout"><section className="forecast-main"><div className="forecast-kicker"><span>✦</span> YOUR PERSONAL FORECAST</div><h2>{course.course_code}<span> / </span>{course.course_name}</h2><p className="forecast-description">Here's what your recorded grades suggest about reaching your target.</p><div className="forecast-result"><div className="forecast-result-top"><span>Average needed on remaining categories</span><span className="forecast-badge">Target · {percent(course.target_grade)}</span></div><div className={`forecast-big-number ${impossible ? 'is-hard' : ''}`}>{!canForecast ? '—' : result.remaining === 0 ? 'Complete' : impossible ? `${percent(result.required)}` : percent(Math.max(0, result.required))}</div><p>{!canForecast ? 'Add grade categories and record scores to unlock your forecast.' : result.remaining === 0 ? 'Every category has a recorded score. Your current weighted result is shown below.' : impossible ? 'Your target may be out of reach with the remaining weight. Consider discussing options with your instructor.' : result.required <= 0 ? 'You have already earned enough weighted points to meet this target, based on the categories recorded.' : `Aim for about ${percent(result.required)} across categories without recorded scores to reach your target.`}</p><div className="forecast-track"><span style={{ width: `${Math.max(0, Math.min(100, result.required ?? 0))}%` }}/></div><div className="track-labels"><span>0%</span><span>100% average</span></div></div><div className="forecast-note"><span>ⓘ</span><p><strong>How this estimate works</strong><br/>Categories with at least one score are treated as completed at their current average. Remaining category weights are treated as future work. This is a planning estimate, not an official university grade calculation.</p></div></section><aside className="forecast-side"><div className="side-stat"><span className="side-stat-icon green">◉</span><div><span>Weighted points earned</span><strong>{percent(result.current)}</strong></div></div><div className="side-stat"><span className="side-stat-icon violet">◷</span><div><span>Weight remaining</span><strong>{percent(result.remaining)}</strong></div></div><div className="side-stat"><span className="side-stat-icon amber">◎</span><div><span>Current category average</span><strong>{courseProgress(course) === null ? '—' : percent(courseProgress(course))}</strong></div></div><div className="side-divider"/><h3>Make your forecast more useful</h3><p>Add your categories and scores to replace the sample estimate with your own progress.</p><button className="button button-primary button-full" onClick={onOpenCourses}>Manage course grades <span>→</span></button></aside></div>
}
function Field({ label, children }) { return <label className="form-field"><span>{label}</span>{children}</label> }
function Modal({ title, subtitle, onClose, children }) { useEffect(() => { const close = (event) => { if (event.key === 'Escape') onClose() }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close) }, [onClose]); return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close" onClick={onClose} aria-label="Close dialog">×</button><div className="modal-symbol">✦</div><h2 id="modal-title">{title}</h2><p>{subtitle}</p>{children}</section></div> }
