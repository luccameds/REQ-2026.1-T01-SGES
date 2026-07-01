import type { Request, Response } from 'express'
import { container } from '@/infra/container/container'
import type { AttendanceStatus } from '@/domain'

export default async function (req: Request, res: Response) {
  const classId = req.params.classId as string
  const { date, justificativaDetalhes, attendances } = req.body

  const [y, m, d] = (date as string).split('-').map(Number)
  const parsedDate = new Date(y, m - 1, d, 12, 0, 0)

  const usecase = container.UpdateAttendanceUsecase
  const output = await usecase.execute({
    classId,
    date: parsedDate,
    justificativaDetalhes,
    attendances: attendances.map((a: { studentId: string; status: AttendanceStatus; justification?: string }) => ({
      studentId: a.studentId,
      status: a.status,
      observacao: a.justification,
    })),
  })
  return res.status(200).json(output)
}
