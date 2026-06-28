import type { Request, Response } from 'express'
import { container } from '@/infra/container/container'
import { ValidationError } from '@/application/infra/services/shared/validation-error'

export default async function (req: Request, res: Response) {
  const { classId, date } = req.query

  if (!classId || typeof classId !== 'string') {
    throw new ValidationError([{ code: 'custom', path: ['classId'], message: 'classId is required' } as any])
  }
  if (!date || typeof date !== 'string') {
    throw new ValidationError([{ code: 'custom', path: ['date'], message: 'date is required (YYYY-MM-DD)' } as any])
  }

  const usecase = container.ListAttendanceByDateUsecase
  const output = await usecase.execute({ classId, date: new Date(date) })
  return res.status(200).json(output)
}
