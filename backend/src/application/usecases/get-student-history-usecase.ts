import { AttendanceStatus, EnrollmentStatus } from '@/domain'
import { NotFoundError } from '@/application/infra/errors'
import type { StudentRepository } from '../services/student-repository'
import type { EnrollmentRepository } from '../services/enrollment-repository'
import type { ClassRepository } from '../services/class-repository'
import type { AttendanceRepository } from '../services/attendance-repository'

export type GetStudentHistoryInput = {
  studentId: string
}

export type GetStudentHistoryOutput = {
  student: {
    id: string
    name: string
    email: string
    codigoMatricula: string
    profissao?: string | null
  }
  enrollments: Array<{
    classId: string
    className: string
    status: string
    semester: string
    createdAt: Date
  }>
  attendanceStats: Array<{
    classId: string
    className: string
    totalClasses: number
    presenceCount: number
    absenceCount: number
    justifiedCount: number
    attendanceRate: number
  }>
  attendanceTimeline: Array<{
    date: Date
    className: string
    status: string
    observacao: string | null
    justificativaDetalhes: string | null
  }>
  evasionAlerts: Array<{
    classId: string
    className: string
    absencesCount: number
    evaded: boolean
  }>
}

export class GetStudentHistoryUseCase {
  public static Name = 'GetStudentHistoryUseCase' as const

  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly classRepository: ClassRepository,
    private readonly attendanceRepository: AttendanceRepository,
  ) {}

  async execute(input: GetStudentHistoryInput): Promise<GetStudentHistoryOutput> {
    const student = await this.studentRepository.findById(input.studentId)
    if (!student) {
      throw new NotFoundError('Student not found')
    }

    const enrollments = await this.enrollmentRepository.findByStudent(input.studentId)
    const attendances = await this.attendanceRepository.findByStudent(input.studentId)

    const classCache = new Map<string, string>()
    const classSemesters = new Map<string, string>()

    for (const enrollment of enrollments) {
      if (!classCache.has(enrollment.classId)) {
        const classRoom = await this.classRepository.findById(enrollment.classId)
        classCache.set(enrollment.classId, classRoom?.nomeCurso ?? 'Unknown Class')
        classSemesters.set(enrollment.classId, '2026.1')
      }
    }

    const outputEnrollments = enrollments.map((e) => ({
      classId: e.classId,
      className: classCache.get(e.classId) ?? 'Unknown Class',
      status: e.status,
      semester: classSemesters.get(e.classId) ?? '',
      createdAt: e.createdAt,
    }))

    const attendanceStats = enrollments.map((e) => {
      const classAttendances = attendances.filter((a) => a.classId === e.classId)
      const totalClasses = classAttendances.length
      const presenceCount = classAttendances.filter((a) => a.status === AttendanceStatus.PRESENT).length
      const absenceCount = classAttendances.filter((a) => a.status === AttendanceStatus.ABSENT).length
      const justifiedCount = classAttendances.filter(
        (a) => a.status === AttendanceStatus.JUSTIFIED || a.status === AttendanceStatus.FT
      ).length

      const attendanceRate = totalClasses > 0 ? Math.round((presenceCount / totalClasses) * 100) : 100

      return {
        classId: e.classId,
        className: classCache.get(e.classId) ?? 'Unknown Class',
        totalClasses,
        presenceCount,
        absenceCount,
        justifiedCount,
        attendanceRate,
      }
    })

    const attendanceTimeline = attendances.map((a) => ({
      date: a.date,
      className: classCache.get(a.classId) ?? 'Unknown Class',
      status: a.status,
      observacao: a.observacao ?? null,
      justificativaDetalhes: a.justificativaDetalhes ?? null,
    }))

    const evasionAlerts = enrollments.map((e) => {
      const classAttendances = attendances.filter((a) => a.classId === e.classId)
      const absencesCount = classAttendances.filter((a) => a.status === AttendanceStatus.ABSENT).length

      return {
        classId: e.classId,
        className: classCache.get(e.classId) ?? 'Unknown Class',
        absencesCount,
        evaded: e.status === EnrollmentStatus.EVADED,
      }
    })

    return {
      student: {
        id: student.id,
        name: student.name,
        email: student.email ?? '',
        codigoMatricula: student.codigoMatricula,
        profissao: student.profissao,
      },
      enrollments: outputEnrollments,
      attendanceStats,
      attendanceTimeline,
      evasionAlerts,
    }
  }
}
