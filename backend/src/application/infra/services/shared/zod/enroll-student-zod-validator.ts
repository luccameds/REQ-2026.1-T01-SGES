import { z } from 'zod'
import { ValidationError } from '../validation-error'
import type { Validator } from '../validator'
import type { EnrollStudentInput } from '@/application/usecases/enroll-student-usecase'

export class EnrollStudentZodValidator implements Validator<EnrollStudentInput> {
  private schema = z.object({
    studentId: z.string().uuid(),
    classId: z.string().uuid(),
  })

  async validate(input: EnrollStudentInput): Promise<EnrollStudentInput> {
    const result = await this.schema.safeParseAsync(input)
    if (!result.success) throw new ValidationError(result.error.issues)
    return result.data
  }
}
