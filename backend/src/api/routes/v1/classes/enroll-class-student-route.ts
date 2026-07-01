import type { Request, Response } from 'express'
import { container } from '@/infra/container/container'

export default async function (req: Request, res: Response) {
  const classId = req.params.classId as string
  const usecase = container.EnrollStudentUsecase
  const output = await usecase.execute({ classId, studentId: req.body.studentId })
  return res.status(201).json(output)
}
