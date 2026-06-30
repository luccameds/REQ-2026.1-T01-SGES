import { Router } from 'express'
import { authMiddleware } from '@/api/middleware/auth-middleware'
import { UserRole } from '@/domain'
import enrollStudentRoute from './enroll-student-route'
import bulkEnrollRoute from './bulk-enroll-route'
import deleteEnrollmentRoute from './delete-enrollment-route'
import getEnrollmentAbsencesRoute from './get-enrollment-absences-route'

const router = Router({ mergeParams: true })

router.post('/', authMiddleware([UserRole.ADMIN, UserRole.TEACHER]), enrollStudentRoute)
router.post('/bulk', authMiddleware([UserRole.ADMIN, UserRole.TEACHER]), bulkEnrollRoute)
router.delete('/:id', authMiddleware([UserRole.ADMIN, UserRole.TEACHER]), deleteEnrollmentRoute)
router.get('/:id/absences', authMiddleware([UserRole.ADMIN, UserRole.TEACHER]), getEnrollmentAbsencesRoute)

export default router
