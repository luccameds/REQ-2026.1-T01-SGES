import { Request, Response } from 'express'
import { ValidationError } from '@/application/infra/services/shared/validation-error'
import { container } from '@/infra/container/container'

export default async function (req: Request, res: Response) {
  const usecase = container.AuthUsecase

  try {
    const output = await usecase.execute({ ...req.body })
    return res.status(200).json(output)
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ errors: error.issues })
    }
    if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    throw error
  }
}
