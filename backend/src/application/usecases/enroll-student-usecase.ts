import { EnrollmentStatus } from '@/domain'
import type { Enrollment } from '@/domain'
import { AppError, ConflictError, NotFoundError } from '@/application/infra/errors'
import type { Validator } from '@/application/infra/services/shared/validator'
import type { EnrollmentRepository } from '../services/enrollment-repository'
import type { ClassRepository } from '../services/class-repository'
import type { StudentRepository } from '../services/student-repository'

export type EnrollStudentInput = {
  studentId: string
  classId: string
}

export class EnrollStudentUseCase {
  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly classRepository: ClassRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly validator: Validator<EnrollStudentInput>
  ) {}

  async execute(input: EnrollStudentInput): Promise<Enrollment> {
    const validatedInput = await this.validator.validate(input)

    const student = await this.studentRepository.findById(validatedInput.studentId)
    if (!student) throw new NotFoundError('Student not found')

    const classRoom = await this.classRepository.findById(validatedInput.classId)
    if (!classRoom) throw new NotFoundError('Class not found')

    const existing = await this.enrollmentRepository.findByStudentAndClass(validatedInput.studentId, validatedInput.classId)
    if (existing) throw new ConflictError('Student is already enrolled in this class')

    const activeCount = await this.enrollmentRepository.countActiveEnrollmentsByClass(validatedInput.classId)
    const limit = classRoom.vagasLimite ?? 50
    if (activeCount >= limit) {
      throw new AppError(422, `Class is full. Maximum limit of ${limit} vacancies reached.`)
    }

    return this.enrollmentRepository.save({
      studentId: validatedInput.studentId,
      classId: validatedInput.classId,
      status: EnrollmentStatus.ACTIVE,
    })
  }
}
