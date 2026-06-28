import { z } from 'zod'
import { ValidationError } from '../validation-error'
import type { Validator } from '../validator'
import { AttendanceStatus } from '@/domain'
import type { RegisterPresenceInput } from '@/application/usecases/teacher-register-presence-usecase'

export class RegisterAttendanceZodValidator implements Validator<RegisterPresenceInput> {
  private schema = z.object({
    classId: z.string().uuid(),
    date: z.coerce.date(),
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
