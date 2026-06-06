import type { User } from '@/domain'

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>
}
