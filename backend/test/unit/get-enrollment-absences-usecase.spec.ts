import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetEnrollmentAbsencesUseCase } from '@/application/usecases/get-enrollment-absences-usecase'
import { AttendanceStatus, EnrollmentStatus } from '@/domain'
import type { EnrollmentRepository } from '@/application/services/enrollment-repository'
import type { AttendanceRepository } from '@/application/services/attendance-repository'
import { NotFoundError } from '@/application/infra/errors'

const makeEnrollment = () => ({
  id: 'enrollment-id',
  studentId: 'student-id',
  classId: 'class-id',
  status: EnrollmentStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
})

const makeAttendance = (status: AttendanceStatus) => ({
  id: `att-${Math.random()}`,
  studentId: 'student-id',
  classId: 'class-id',
  date: new Date(),
  status,
  observacao: null,
  justificativaDetalhes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
})

describe('GetEnrollmentAbsencesUseCase', () => {
  let enrollmentRepository: EnrollmentRepository
  let attendanceRepository: AttendanceRepository
  let sut: GetEnrollmentAbsencesUseCase

  beforeEach(() => {
    enrollmentRepository = {
      findById: vi.fn().mockResolvedValue(makeEnrollment()),
      findByStudentAndClass: vi.fn(),
      findActiveByClass: vi.fn(),
      countActiveEnrollmentsByClass: vi.fn(),
      getFunnelData: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      updateStatus: vi.fn(),
      deleteById: vi.fn(),
    }
    attendanceRepository = {
      findById: vi.fn(),
      findByStudentClassAndDate: vi.fn(),
      findByClassAndDate: vi.fn(),
      findStudentAttendances: vi.fn().mockResolvedValue([]),
      save: vi.fn(),
      deleteById: vi.fn(),
    }
    sut = new GetEnrollmentAbsencesUseCase(enrollmentRepository, attendanceRepository)
  })

  it('should return 0 absences when student has no attendance records', async () => {
    const result = await sut.execute({ enrollmentId: 'enrollment-id' })
    expect(result.absencesCount).toBe(0)
    expect(result.enrollmentId).toBe('enrollment-id')
  })

  it('should count only ABSENT status as absence (not JUSTIFIED or FT)', async () => {
    vi.mocked(attendanceRepository.findStudentAttendances).mockResolvedValue([
      makeAttendance(AttendanceStatus.ABSENT),
      makeAttendance(AttendanceStatus.ABSENT),
      makeAttendance(AttendanceStatus.JUSTIFIED),
      makeAttendance(AttendanceStatus.FT),
      makeAttendance(AttendanceStatus.PRESENT),
    ])
    const result = await sut.execute({ enrollmentId: 'enrollment-id' })
    expect(result.absencesCount).toBe(2)
  })

  it('should throw NotFoundError when enrollment does not exist', async () => {
    vi.mocked(enrollmentRepository.findById).mockResolvedValue(null)
    await expect(sut.execute({ enrollmentId: 'bad-id' })).rejects.toBeInstanceOf(NotFoundError)
  })

  it('should return the enrollment status along with absences count', async () => {
    const enrollment = { ...makeEnrollment(), status: EnrollmentStatus.EVADED }
    vi.mocked(enrollmentRepository.findById).mockResolvedValue(enrollment)
    const result = await sut.execute({ enrollmentId: 'enrollment-id' })
    expect(result.status).toBe(EnrollmentStatus.EVADED)
  })
})
