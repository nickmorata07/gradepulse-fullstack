// Authenticated workspaces always use the real API; no demo-mode bypass.
export const USING_MOCK_API=false
export {listCourses,createCourse,getCourse,deleteCourse,createCategory,createAssessment,updateTarget,updateCompletion,deleteAssessment} from './httpApi'
