import { EnrollmentStatus } from '@/domain'
import type { Enrollment } from '@/domain'
import type { Validator } from '@/application/infra/services/shared/validator'
import type { EnrollmentRepository } from '../services/enrollment-repository'
import type { ClassRepository } from '../services/class-repository'
import type { StudentRepository } from '../services/student-repository'

export type BulkEnrollStudentsInput = {
  classId: string
  studentIds: string[]
}

export type BulkEnrollStudentsOutput = {
  enrolled: Enrollment[]
  failed: { studentId: string; reason: string }[]
}

export class BulkEnrollStudentsUseCase {
  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly classRepository: ClassRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly validator: Validator<BulkEnrollStudentsInput>
  ) {}

  async execute(input: BulkEnrollStudentsInput): Promise<BulkEnrollStudentsOutput> {
    const validatedInput = await this.validator.validate(input)

    const enrolled: Enrollment[] = []
    const failed: { studentId: string; reason: string }[] = []

    const classRoom = await this.classRepository.findById(validatedInput.classId)
    if (!classRoom) {
      return {
        enrolled: [],
        failed: validatedInput.studentIds.map((studentId) => ({ studentId, reason: 'Class not found' })),
      }
    }

    for (const studentId of validatedInput.studentIds) {
      try {
        const student = await this.studentRepository.findById(studentId)
        if (!student) {
          failed.push({ studentId, reason: 'Student not found' })
          continue
        }

        const existing = await this.enrollmentRepository.findByStudentAndClass(studentId, validatedInput.classId)
        if (existing) {
          failed.push({ studentId, reason: 'Student is already enrolled in this class' })
          continue
        }

        const activeCount = await this.enrollmentRepository.countActiveEnrollmentsByClass(validatedInput.classId)
        const limit = classRoom.vagasLimite ?? 50
        if (activeCount >= limit) {
          failed.push({ studentId, reason: `Class is full. Maximum limit of ${limit} vacancies reached.` })
          continue
        }

        const enrollment = await this.enrollmentRepository.save({
          studentId,
          classId: validatedInput.classId,
          status: EnrollmentStatus.ACTIVE,
        })
        enrolled.push(enrollment)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        failed.push({ studentId, reason: message })
      }
    }

    return { enrolled, failed }
  }
}
