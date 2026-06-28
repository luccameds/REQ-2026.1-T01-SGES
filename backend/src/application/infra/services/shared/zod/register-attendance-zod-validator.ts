import { z } from 'zod'
import { ValidationError } from '../validation-error'
import type { Validator } from '../validator'
import { AttendanceStatus } from '@/domain'
import type { RegisterPresenceInput } from '@/application/usecases/teacher-register-presence-usecase'

export class RegisterAttendanceZodValidator implements Validator<RegisterPresenceInput> {
  private schema = z.object({
    classId: z.string().uuid(),
    date: z.union([
      z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
        .transform(s => {
          const [y, m, d] = s.split('-').map(Number)
          return new Date(y, m - 1, d, 12, 0, 0)
        }),
      z.date().transform(dt => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 12, 0, 0)),
    ]),
    alertThreshold: z.number().int().min(1).optional(),
    attendances: z.array(
      z.object({
        studentId: z.string().uuid(),
        status: z.enum([
          AttendanceStatus.PRESENT,
          AttendanceStatus.ABSENT,
          AttendanceStatus.JUSTIFIED,
          AttendanceStatus.FT,
        ]),
        observacao: z.string().optional(),
        justificativaDetalhes: z.string().optional(),
      })
    ).min(1),
  })

  async validate(input: RegisterPresenceInput): Promise<RegisterPresenceInput> {
    const result = await this.schema.safeParseAsync(input)
    if (!result.success) throw new ValidationError(result.error.issues)
    return result.data
  }
}
