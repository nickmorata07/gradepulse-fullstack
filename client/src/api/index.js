import * as mockApi from './mockApi.js'
import * as httpApi from './httpApi.js'

export const USING_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'
const api = USING_MOCK_API ? mockApi : httpApi

export const listCourses = (...args) => api.listCourses(...args)
export const createCourse = (...args) => api.createCourse(...args)
export const getCourse = (...args) => api.getCourse(...args)
export const deleteCourse = (...args) => api.deleteCourse(...args)
export const createCategory = (...args) => api.createCategory(...args)
export const createAssessment = (...args) => api.createAssessment(...args)
