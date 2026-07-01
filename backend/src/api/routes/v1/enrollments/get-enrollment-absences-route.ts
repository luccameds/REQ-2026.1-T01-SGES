import type { Request, Response } from 'express'
import { container } from '@/infra/container/container'

export default async function (req: Request, res: Response) {
  const usecase = container.GetEnrollmentAbsencesUsecase
  const output = await usecase.execute({ enrollmentId: req.params.id as string })
  return res.status(200).json(output)
}
