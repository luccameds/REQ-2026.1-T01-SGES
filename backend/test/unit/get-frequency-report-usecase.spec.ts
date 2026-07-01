import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetFrequencyReportUseCase } from '@/application/usecases/get-frequency-report-usecase'
import { AttendanceStatus, EnrollmentStatus } from '@/domain'
import type { EnrollmentRepository } from '@/application/services/enrollment-repository'
import type { AttendanceRepository } from '@/application/services/attendance-repository'
import type { ClassRepository } from '@/application/services/class-repository'
import type { StudentRepository } from '@/application/services/student-repository'

const STUDENT_ID = 'student-id'
const CLASS_ID = 'class-id'

const makeStudent = () => ({
  id: STUDENT_ID,
  name: 'Maria Antônia Silva',
  email: 'maria.antonia@seas.com',
  codigo_matricula: 'MAT-000123',
})

const makeEnrollment = () => ({
  id: 'enrollment-id',
  studentId: STUDENT_ID,
  classId: CLASS_ID,
  status: EnrollmentStatus.ACTIVE,
  createdAt: new Date(),
})

const makeClass = () => ({
  id: CLASS_ID,
  nomeCurso: 'Curso de Corte e Costura',
  semester: '2026.1',
})

describe('GetFrequencyReportUseCase', () => {
  let enrollmentRepository: EnrollmentRepository
  let attendanceRepository: AttendanceRepository
  let classRepository: ClassRepository
  let studentRepository: StudentRepository
  let sut: GetFrequencyReportUseCase

  beforeEach(() => {
    enrollmentRepository = {
      findAll: vi.fn().mockResolvedValue({ enrollments: [makeEnrollment()], total: 1 }),
      findActiveByClass: vi.fn().mockResolvedValue([makeEnrollment()]),
    } as any

    attendanceRepository = {
      findStudentAttendances: vi.fn().mockResolvedValue([
        {
          id: 'att-1',
          classId: CLASS_ID,
          studentId: STUDENT_ID,
          date: new Date(),
          status: AttendanceStatus.PRESENT,
          observacao: null,
          justificativaDetalhes: null,
        }
      ]),
    } as any

    classRepository = {
      findById: vi.fn().mockResolvedValue(makeClass()),
      findAll: vi.fn().mockResolvedValue({ classes: [makeClass()], total: 1 }),
    } as any

    studentRepository = {
      findById: vi.fn().mockResolvedValue(makeStudent()),
    } as any

    sut = new GetFrequencyReportUseCase(
      studentRepository,
      enrollmentRepository,
      classRepository,
      attendanceRepository,
    )
  })

  it('should return masked frequency report entries', async () => {
    const res = await sut.execute({})

    expect(res).toHaveLength(1)
    const entry = res[0]
    expect(entry.studentName).toBe('M**** A**** S****')
    expect(entry.studentEmail).toBe('ma****@seas.com')
    expect(entry.attendanceRate).toBe(100)
  })

  it('should support filtering by classId', async () => {
    const res = await sut.execute({ classId: CLASS_ID })

    expect(res).toHaveLength(1)
    expect(enrollmentRepository.findActiveByClass).toHaveBeenCalledWith(CLASS_ID)
  })
})
