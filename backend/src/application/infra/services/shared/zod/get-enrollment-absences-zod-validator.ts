import { z } from 'zod'
import { ValidationError } from '../validation-error'
import type { Validator } from '../validator'
import type { GetEnrollmentAbsencesInput } from '@/application/usecases/get-enrollment-absences-usecase'

export class GetEnrollmentAbsencesZodValidator implements Validator<GetEnrollmentAbsencesInput> {
  private schema = z.object({
    enrollmentId: z.string().uuid(),
  })

  async validate(input: GetEnrollmentAbsencesInput): Promise<GetEnrollmentAbsencesInput> {
    const result = await this.schema.safeParseAsync(input)
    if (!result.success) throw new ValidationError(result.error.issues)
    return result.data
  }
}
