const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '')
async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } })
  if (!response.ok) { let message = `${response.status} ${response.statusText}`; try { message = (await response.json()).error || message } catch {} throw new Error(message) }
  return response.status === 204 ? null : response.json()
}
export const listCourses = () => request('/api/courses')
export const createCourse = (data) => request('/api/courses', { method: 'POST', body: JSON.stringify(data) })
export const getCourse = (id) => request(`/api/courses/${id}`)
export const deleteCourse = (id) => request(`/api/courses/${id}`, { method: 'DELETE' })
export const createCategory = (courseId, data) => request(`/api/courses/${courseId}/categories`, { method: 'POST', body: JSON.stringify(data) })
export const createAssessment = (categoryId, data) => request(`/api/categories/${categoryId}/assessments`, { method: 'POST', body: JSON.stringify(data) })
