import type { Request, Response } from 'express'
import { container } from '@/infra/container/container'

export default async function (req: Request, res: Response) {
  const usecase = container.EnrollStudentUsecase
  const output = await usecase.execute(req.body)
  return res.status(201).json(output)
}
