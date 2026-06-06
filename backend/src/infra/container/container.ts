import { DIContainer } from 'rsdi'
import { AuthUsecaseZodValidator } from '../../application/infra/services/shared/zod/auth-usecase-zod-validator'
import { AuthUseCase } from '../../application/usecases/auth-usecase'
import { env } from '../../env'
import { UserTypeormRepository } from '../orm/repositories/user-repository'
import { JwtTokenService } from '../services/token-service'
import { dataSource } from '../orm/datasource'

export type AppContainer = ReturnType<typeof buildContainer>

export function buildContainer() {
  return new DIContainer()
    .add('UserRepository', () => new UserTypeormRepository(dataSource))
    .add('TokenService', () => new JwtTokenService(env.JWT_SECRET))
    .add('AuthUsecase', ({ UserRepository, TokenService }) =>
      new AuthUseCase(UserRepository, TokenService, new AuthUsecaseZodValidator()),
    )
}

export const container = buildContainer();