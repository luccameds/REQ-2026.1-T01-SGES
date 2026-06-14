import type { DataSource } from 'typeorm'
import type { EnrollmentRepository } from '@/application/services/enrollment-repository'
import { EnrollmentStatus } from '@/domain'
import type { BaseDomain, Enrollment } from '@/domain'
import { EnrollmentEntity } from '../entity/enrollment-entity'

export class EnrollmentTypeormRepository implements EnrollmentRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findById(id: string): Promise<Enrollment | null> {
    const repo = this.dataSource.getRepository(EnrollmentEntity)
    const entity = await repo.findOne({ where: { id } })
    if (!entity) return null
    return this.toEnrollment(entity)
  }

  async findByStudentAndClass(studentId: string, classId: string): Promise<Enrollment | null> {
    const repo = this.dataSource.getRepository(EnrollmentEntity)
    const entity = await repo.findOne({ where: { studentId, classId } })
    if (!entity) return null
    return this.toEnrollment(entity)
  }

  async countActiveEnrollmentsByClass(classId: string): Promise<number> {
    const repo = this.dataSource.getRepository(EnrollmentEntity)
    const count = await repo.count({ where: { classId, status: EnrollmentStatus.ACTIVE } })
    return count
  }

  async findAll(page: number, limit: number): Promise<{ enrollments: Enrollment[]; total: number }> {
    const repo = this.dataSource.getRepository(EnrollmentEntity)
    const [entities, total] = await repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    })
    return { enrollments: entities.map((e) => this.toEnrollment(e)), total }
  }

  async save(data: Omit<Enrollment, keyof BaseDomain>): Promise<Enrollment> {
    const repo = this.dataSource.getRepository(EnrollmentEntity)
    const saved = await repo.save(repo.create(data))
    return this.toEnrollment(saved)
  }

  async updateStatus(id: string, status: EnrollmentStatus): Promise<void> {
    const repo = this.dataSource.getRepository(EnrollmentEntity)
    await repo.update({ id }, { status })
  }

  async deleteById(id: string): Promise<void> {
    const repo = this.dataSource.getRepository(EnrollmentEntity)
    await repo.delete({ id })
  }

  private toEnrollment(entity: EnrollmentEntity): Enrollment {
    return {
      id: entity.id,
      studentId: entity.studentId,
      classId: entity.classId,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    }
  }
}
