import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { UserEntity } from '../src/infra/orm/entity/user-entity'
import { StudentEntity } from '../src/infra/orm/entity/student-entity'
import { ClassEntity } from '../src/infra/orm/entity/class-entity'
import { InstructorHistoryEntity } from '../src/infra/orm/entity/instructor-history-entity'
import { NotificationEntity } from '../src/infra/orm/entity/notification-entity'
import { FormEntity, FormResponseEntity } from '../src/infra/orm/entity/form-entity'
import { AttendanceEntity } from '../src/infra/orm/entity/attendance-entity'
import { EnrollmentEntity } from '../src/infra/orm/entity/enrollment-entity'
import { CreateUsersTable1780757930000 } from '../src/infra/orm/migrations/1780757930000-CreateUsersTable'
import { AddResetCodeToUsers1780857930000 } from '../src/infra/orm/migrations/1780857930000-AddResetCodeToUsers'
import { FixResetCodeExpiresAtTimezone1780957930000 } from '../src/infra/orm/migrations/1780957930000-FixResetCodeExpiresAtTimezone'
import { CreateEnrollmentTables1782000000000 } from '../src/infra/orm/migrations/1782000000000-CreateEnrollmentTables'

export async function setup(): Promise<void> {
  const url = process.env.POSTGRES_URL
  if (!url) return

  const ds = new DataSource({
    type: 'postgres',
    url,
    ssl: false,
    migrationsRun: true,
    entities: [
      UserEntity,
      StudentEntity,
      ClassEntity,
      InstructorHistoryEntity,
      NotificationEntity,
      FormEntity,
      FormResponseEntity,
      AttendanceEntity,
      EnrollmentEntity,
    ],
    migrations: [
      CreateUsersTable1780757930000,
      AddResetCodeToUsers1780857930000,
      FixResetCodeExpiresAtTimezone1780957930000,
      CreateEnrollmentTables1782000000000,
    ],
  })

  await ds.initialize()
  await ds.destroy()
}
