import { AttendanceStatus } from '@/domain'
import type { EnrollmentStatus } from '@/domain'
import { NotFoundError } from '@/application/infra/errors'
import type { EnrollmentRepository } from '../services/enrollment-repository'
import type { AttendanceRepository } from '../services/attendance-repository'

export type GetEnrollmentAbsencesInput = {
  enrollmentId: string
}

export type GetEnrollmentAbsencesOutput = {
  enrollmentId: string
  studentId: string
  classId: string
  absencesCount: number
  status: EnrollmentStatus
}

export class GetEnrollmentAbsencesUseCase {
  constructor(
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly attendanceRepository: AttendanceRepository
  ) {}

  async execute(input: GetEnrollmentAbsencesInput): Promise<GetEnrollmentAbsencesOutput> {
    const enrollment = await this.enrollmentRepository.findById(input.enrollmentId)
    if (!enrollment) throw new NotFoundError('Enrollment not found')

    const attendances = await this.attendanceRepository.findStudentAttendances(
      enrollment.studentId,
      enrollment.classId
    )

    const absencesCount = attendances.filter((a) => a.status === AttendanceStatus.ABSENT).length

    return {
      enrollmentId: enrollment.id,
      studentId: enrollment.studentId,
      classId: enrollment.classId,
      absencesCount,
      status: enrollment.status,
    }
  }
}
