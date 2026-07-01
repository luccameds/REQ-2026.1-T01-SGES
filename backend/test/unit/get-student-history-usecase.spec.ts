import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetStudentHistoryUseCase } from '@/application/usecases/get-student-history-usecase'
import { AttendanceStatus, EnrollmentStatus, UserRole } from '@/domain'
import { NotFoundError } from '@/application/infra/errors'
import type { StudentRepository } from '@/application/services/student-repository'
import type { EnrollmentRepository } from '@/application/services/enrollment-repository'
import type { AttendanceRepository } from '@/application/services/attendance-repository'
import type { ClassRepository } from '@/application/services/class-repository'

const STUDENT_ID = 'student-id'
const CLASS_ID = 'class-id'

const makeStudent = () => ({
  id: STUDENT_ID,
  name: 'Estudante Teste',
  email: 'student@test.com',
  codigoMatricula: '12345678',
  profissao: 'Estudante',
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
  nomeCurso: 'Curso de Culinária',
  semester: '2026.1',
})

describe('GetStudentHistoryUseCase', () => {
  let studentRepository: StudentRepository
  let enrollmentRepository: EnrollmentRepository
  let attendanceRepository: AttendanceRepository
  let classRepository: ClassRepository
  let sut: GetStudentHistoryUseCase

  beforeEach(() => {
    studentRepository = {
      findById: vi.fn().mockResolvedValue(makeStudent()),
    } as any

    enrollmentRepository = {
      findByStudent: vi.fn().mockResolvedValue([makeEnrollment()]),
    } as any

    attendanceRepository = {
      findByStudent: vi.fn().mockResolvedValue([
        {
          id: 'att-1',
          classId: CLASS_ID,
          studentId: STUDENT_ID,
          date: new Date(),
          status: AttendanceStatus.PRESENT,
          observacao: 'No comments',
          justificativaDetalhes: null,
        }
      ]),
    } as any

    classRepository = {
      findById: vi.fn().mockResolvedValue(makeClass()),
    } as any

    sut = new GetStudentHistoryUseCase(
      studentRepository,
      enrollmentRepository,
      classRepository,
      attendanceRepository,
    )
  })

  it('should successfully get student history', async () => {
    const res = await sut.execute({ studentId: STUDENT_ID })

    expect(res.student.name).toBe('Estudante Teste')
    expect(res.enrollments).toHaveLength(1)
    expect(res.attendanceStats).toHaveLength(1)
    expect(res.attendanceStats[0].attendanceRate).toBe(100)
    expect(res.attendanceTimeline).toHaveLength(1)
  })

  it('should throw if student is not found', async () => {
    vi.mocked(studentRepository.findById).mockResolvedValue(null)
    await expect(sut.execute({ studentId: 'non-existing' })).rejects.toThrow(NotFoundError)
  })
})
