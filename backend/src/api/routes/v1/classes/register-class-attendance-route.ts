import type { Request, Response } from 'express'
import { container } from '@/infra/container/container'
import type { AttendanceStatus } from '@/domain'

export default async function (req: Request, res: Response) {
  const classId = req.params.classId as string
  const { date, attendances } = req.body

  const usecase = container.TeacherRegisterPresenceUsecase
  const output = await usecase.execute({
    classId,
    date,
    attendances: attendances.map((a: { studentId: string; status: AttendanceStatus; justification?: string }) => ({
      studentId: a.studentId,
      status: a.status,
      observacao: a.justification,
    })),
  })
  return res.status(200).json(output)
}
