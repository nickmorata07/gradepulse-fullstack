import seed from './seed.json'
const KEY = 'gradepulse:courses:v1'
const wait = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms))

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* recover from invalid local storage */ }
  const initial = seed.map((course) => ({ ...course, categories: course.categories.map((category) => ({ ...category, assessments: [...category.assessments] })) }))
  localStorage.setItem(KEY, JSON.stringify(initial))
  return initial
}
function write(courses) { localStorage.setItem(KEY, JSON.stringify(courses)); return courses }
export async function listCourses() { await wait(); return read().sort((a, b) => b.created_at.localeCompare(a.created_at)) }
export async function createCourse(input) {
  await wait()
  const courses = read()
  const course = { id: crypto.randomUUID(), course_code: input.course_code.trim().toUpperCase(), course_name: input.course_name.trim(), target_grade: Number(input.target_grade), created_at: new Date().toISOString(), categories: [] }
  write([course, ...courses]); return course
}
export async function getCourse(id) { await wait(); const course = read().find((item) => String(item.id) === String(id)); if (!course) throw new Error('Course not found'); return course }
export async function deleteCourse(id) { await wait(); write(read().filter((course) => String(course.id) !== String(id))) }
export async function createCategory(courseId, input) {
  await wait(); const courses = read(); const course = courses.find((item) => String(item.id) === String(courseId)); if (!course) throw new Error('Course not found')
  const category = { id: crypto.randomUUID(), category_name: input.category_name.trim(), weight_percentage: Number(input.weight_percentage), assessments: [] }
  course.categories.push(category); write(courses); return category
}
export async function createAssessment(categoryId, input) {
  await wait(); const courses = read(); let created
  for (const course of courses) for (const category of course.categories) if (String(category.id) === String(categoryId)) {
    created = { id: crypto.randomUUID(), item_name: input.item_name.trim(), score: Number(input.score), max_score: Number(input.max_score) }; category.assessments.push(created); category.is_complete=false
  }
  if (!created) throw new Error('Category not found'); write(courses); return created
}

export async function updateTarget(id, {target_grade}) {
 await wait(); if (!Number.isFinite(target_grade) || target_grade<0 || target_grade>100) throw Error('Target must be between 0 and 100.')
 const courses=read(), c=courses.find(c=>String(c.id)===String(id)); if(!c) throw Error('Course not found'); c.target_grade=target_grade;write(courses);return c
}
export async function updateCompletion(id, {is_complete}) {
 await wait();const courses=read();const c=courses.flatMap(c=>c.categories).find(c=>String(c.id)===String(id));if(!c)throw Error('Category not found');if(is_complete&&!c.assessments.length)throw Error('Record a score first.');c.is_complete=is_complete;write(courses);return c
}
export async function deleteAssessment(id) {
 await wait();const courses=read();let found=false;for(const course of courses)for(const c of course.categories){if(c.assessments.some(a=>String(a.id)===String(id))){c.assessments=c.assessments.filter(a=>String(a.id)!==String(id));c.is_complete=false;found=true}}
 if(!found)throw Error('Assessment not found');write(courses)
}
