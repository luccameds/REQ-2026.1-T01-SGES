import type { Request, Response } from 'express'
import { container } from '@/infra/container/container'
import { NotFoundError } from '@/application/infra/errors'

export default async function (req: Request, res: Response) {
  const id = req.params.id as string
  const enrollmentRepository = container.EnrollmentRepository
  const enrollment = await enrollmentRepository.findById(id)
  if (!enrollment) throw new NotFoundError('Enrollment not found')
  await enrollmentRepository.deleteById(id)
  return res.status(204).send()
}
