import { Router } from 'express'
import { authMiddleware } from '@/api/middleware/auth-middleware'
import { UserRole } from '@/domain'
import listClassStudentsRoute from './list-class-students-route'
import enrollClassStudentRoute from './enroll-class-student-route'
import unenrollClassStudentRoute from './unenroll-class-student-route'
import registerClassAttendanceRoute from './register-class-attendance-route'

const router = Router({ mergeParams: true })

router.get('/:classId/students', authMiddleware([UserRole.ADMIN, UserRole.TEACHER]), listClassStudentsRoute)
router.post('/:classId/students', authMiddleware([UserRole.ADMIN, UserRole.TEACHER]), enrollClassStudentRoute)
router.delete('/:classId/students/:studentId', authMiddleware([UserRole.ADMIN, UserRole.TEACHER]), unenrollClassStudentRoute)
router.post('/:classId/attendances', authMiddleware([UserRole.ADMIN, UserRole.TEACHER]), registerClassAttendanceRoute)

export default router
