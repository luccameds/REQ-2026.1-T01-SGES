import type { Request, Response } from 'express'
import { container } from '@/infra/container/container'
import { NotFoundError } from '@/application/infra/errors'

export default async function (req: Request, res: Response) {
  const classId = req.params.classId as string
  const studentId = req.params.studentId as string
  const enrollmentRepository = container.EnrollmentRepository
  const enrollment = await enrollmentRepository.findByStudentAndClass(studentId, classId)
  if (!enrollment) throw new NotFoundError('Enrollment not found')
  await enrollmentRepository.deleteById(enrollment.id)
  return res.status(204).send()
}
