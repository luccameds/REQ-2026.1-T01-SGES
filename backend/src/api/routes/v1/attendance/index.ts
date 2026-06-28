import { Router } from 'express'
import { authMiddleware } from '@/api/middleware/auth-middleware'
import { UserRole } from '@/domain'
import registerAttendanceRoute from './register-attendance-route'
import listAttendanceRoute from './list-attendance-route'

const router = Router({ mergeParams: true })

router.post('/', authMiddleware([UserRole.ADMIN, UserRole.TEACHER]), registerAttendanceRoute)
router.get('/', authMiddleware([UserRole.ADMIN, UserRole.TEACHER]), listAttendanceRoute)

export default router
