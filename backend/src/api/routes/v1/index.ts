import { Router } from 'express'
import auth from './auth'
import users from './users'
import enrollments from './enrollments'
import attendance from './attendance'
import classes from './classes'

const router = Router()

router.use('/auth', auth)
router.use('/users', users)
router.use('/enrollments', enrollments)
router.use('/attendance', attendance)
router.use('/classes', classes)

export { router as routes }
