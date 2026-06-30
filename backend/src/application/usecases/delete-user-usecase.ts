import type { Validator } from '@/application/infra/services/shared/validator'
import { NotFoundError } from '@/application/infra/errors'
import logger from '@/infra/logger'
import type { UserRepository } from '../services/user-repository'
import type { SecurityLogRepository } from '../services/security-log-repository'

export class DeleteUserUseCase {
  public static Name = 'DeleteUserUseCase' as const

  constructor(
    private readonly userRepository: UserRepository,
    private readonly validator: Validator<DeleteUserUseCase.Input>,
    private readonly securityLogRepository: SecurityLogRepository,
  ) {}

  async execute(input: DeleteUserUseCase.Input): Promise<void> {
    const validatedInput = await this.validator.validate(input)

    logger.debug({ userId: validatedInput.id }, 'DeleteUser: iniciando deleção')

    const user = await this.userRepository.findById(validatedInput.id)
    if (!user) {
      logger.info({ userId: validatedInput.id }, 'DeleteUser: usuário não encontrado')
      throw new NotFoundError('User not found')
    }

    await this.userRepository.deleteById(validatedInput.id)

    await this.securityLogRepository.save({
      userId: validatedInput.id,
      action: 'INACTIVATE_USER',
      details: `User email: ${user.email}, role: ${user.role}, name: ${user.name}`,
    })

    logger.info({ userId: validatedInput.id, email: user.email }, 'DeleteUser: usuário deletado')
  }
}

export namespace DeleteUserUseCase {
  export type Input = {
    id: string
  }
}
