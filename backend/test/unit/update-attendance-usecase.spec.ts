import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UpdateAttendanceUseCase } from '@/application/usecases/update-attendance-usecase'
import { AttendanceStatus, EnrollmentStatus, UserRole } from '@/domain'
import { NotFoundError, ForbiddenError, AppError } from '@/application/infra/errors'
import type { ClassRepository } from '@/application/services/class-repository'
import type { StudentRepository } from '@/application/services/student-repository'
import type { EnrollmentRepository } from '@/application/services/enrollment-repository'
import type { AttendanceRepository } from '@/application/services/attendance-repository'
import type { SecurityLogRepository } from '@/application/services/security-log-repository'
import type { UserRepository } from '@/application/services/user-repository'
import type { NotificationRepository } from '@/application/services/notification-repository'
import type { IEmailService } from '@/application/services/email-service'

const CLASS_ID = 'class-id'
const STUDENT_ID = 'student-id'
const ENROLLMENT_ID = 'enrollment-id'

const makeClass = () => ({
  id: CLASS_ID,
  nomeCurso: 'Curso de Culinária',
  semester: '2026.1',
  instructors: [
    { id: 'inst-1', name: 'Professor Teste', email: 'teacher@test.com', role: UserRole.TEACHER }
  ]
})

const makeStudent = () => ({
  id: STUDENT_ID,
  name: 'Estudante Teste',
  email: 'student@test.com',
  codigoMatricula: '12345678',
})

const makeEnrollment = () => ({
  id: ENROLLMENT_ID,
  studentId: STUDENT_ID,
  classId: CLASS_ID,
  status: EnrollmentStatus.ACTIVE,
})

describe('UpdateAttendanceUseCase', () => {
  let classRepository: ClassRepository
  let studentRepository: StudentRepository
  let enrollmentRepository: EnrollmentRepository
  let attendanceRepository: AttendanceRepository
  let securityLogRepository: SecurityLogRepository
  let userRepository: UserRepository
  let notificationRepository: NotificationRepository
  let emailService: IEmailService
  let sut: UpdateAttendanceUseCase

  beforeEach(() => {
    classRepository = {
      findById: vi.fn().mockResolvedValue(makeClass()),
    } as any

    studentRepository = {
      findById: vi.fn().mockResolvedValue(makeStudent()),
    } as any

    enrollmentRepository = {
      findByStudentAndClass: vi.fn().mockResolvedValue(makeEnrollment()),
      updateStatus: vi.fn(),
    } as any

    attendanceRepository = {
      save: vi.fn().mockImplementation(async (data) => ({ id: 'att-id', ...data })),
      findByStudentClassAndDate: vi.fn().mockResolvedValue({ id: 'att-old', status: AttendanceStatus.PRESENT }),
      findStudentAttendances: vi.fn().mockResolvedValue([]),
    } as any

    securityLogRepository = {
      save: vi.fn().mockResolvedValue({ id: 'log-id' }),
    } as any

    userRepository = {
      findAdmins: vi.fn().mockResolvedValue([
        { id: 'admin-1', name: 'Admin Teste', email: 'admin@test.com', role: UserRole.ADMIN }
      ]),
    } as any

    notificationRepository = {
      save: vi.fn().mockResolvedValue({ id: 'notif-id' }),
    } as any

    emailService = {
      sendAbsenceAlert: vi.fn().mockResolvedValue(undefined),
    } as any

    sut = new UpdateAttendanceUseCase(
      classRepository,
      studentRepository,
      enrollmentRepository,
      attendanceRepository,
      securityLogRepository,
      userRepository,
      notificationRepository,
      emailService,
    )
  })

  it('should successfully update attendance within 72 hours', async () => {
    const res = await sut.execute({
      classId: CLASS_ID,
      date: new Date(),
      justificativaDetalhes: 'Correção de erro operacional',
      attendances: [{ studentId: STUDENT_ID, status: AttendanceStatus.ABSENT }]
    })

    expect(res).toHaveLength(1)
    expect(attendanceRepository.save).toHaveBeenCalled()
    expect(securityLogRepository.save).toHaveBeenCalled()
  })

  it('should fail if date is older than 72 hours', async () => {
    const oldDate = new Date()
    oldDate.setHours(oldDate.getHours() - 73)

    await expect(
      sut.execute({
        classId: CLASS_ID,
        date: oldDate,
        justificativaDetalhes: 'Correção de erro',
        attendances: [{ studentId: STUDENT_ID, status: AttendanceStatus.ABSENT }]
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should fail if justification is missing', async () => {
    await expect(
      sut.execute({
        classId: CLASS_ID,
        date: new Date(),
        justificativaDetalhes: '',
        attendances: [{ studentId: STUDENT_ID, status: AttendanceStatus.ABSENT }]
      })
    ).rejects.toBeInstanceOf(AppError)
  })
})
