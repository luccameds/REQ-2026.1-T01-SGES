import { z } from 'zod'
import { ValidationError } from '../validation-error'
import type { Validator } from '../validator'
import type { ListAttendanceByDateInput } from '@/application/usecases/list-attendance-by-date-usecase'

export class ListAttendanceByDateZodValidator implements Validator<ListAttendanceByDateInput> {
  private schema = z.object({
    classId: z.string().uuid(),
    date: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .transform(s => {
        const [y, m, d] = s.split('-').map(Number)
        return new Date(y, m - 1, d, 12, 0, 0)
      }),
  })

  async validate(input: ListAttendanceByDateInput): Promise<ListAttendanceByDateInput> {
    const result = await this.schema.safeParseAsync(input)
    if (!result.success) throw new ValidationError(result.error.issues)
    return result.data
  }
}
