import type { Request, Response } from 'express'
import { container } from '@/infra/container/container'

export default async function (req: Request, res: Response) {
  const { studentId } = req.params

  const usecase = container.GetStudentHistoryUsecase
  const output = await usecase.execute({ studentId: studentId as string })

  return res.status(200).json(output)
}
