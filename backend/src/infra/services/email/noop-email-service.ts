import type { IEmailService } from '@/application/services/email-service'
import type { QueueJobData, QueueNames } from '@/application/services/queue-producer'

export class NoopEmailService implements IEmailService {
  async sendCredentials(_data: QueueJobData[typeof QueueNames.SEND_CREDENTIALS]): Promise<void> {}
  async sendResetCode(_data: QueueJobData[typeof QueueNames.SEND_RESET_CODE]): Promise<void> {}
  async sendAbsenceAlert(_email: string, _data: { studentName: string; courseName: string; absencesCount: number; limitReached: boolean }): Promise<void> {}
}
