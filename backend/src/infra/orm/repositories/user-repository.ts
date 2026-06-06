import type { DataSource } from 'typeorm'
import type { UserRepository } from '@/application/services/user-repository'
import type { User } from '@/domain'
import { UserEntity } from '../entity/user-entity'

export class UserTypeormRepository implements UserRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findByEmail(email: string): Promise<User | null> {
    const repo = this.dataSource.getRepository(UserEntity)
    const entity = await repo.findOne({ where: { email } })

    if (!entity) return null

    return {
      id: entity.id,
      registerCode: entity.registerCode,
      name: entity.name,
      email: entity.email,
      password: entity.password,
      role: entity.role,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    }
  }
}
