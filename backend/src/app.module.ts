import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { Student } from './students/student.entity'
import { StudentsModule } from './students/students.module'

const databaseUrl = process.env.DATABASE_URL
const typeOrmConfig = databaseUrl
  ? {
      type: 'postgres' as const,
      url: databaseUrl,
      ssl: { rejectUnauthorized: false },
      entities: [Student],
      synchronize: true,
    }
  : {
      type: 'postgres' as const,
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'students',
      entities: [Student],
      synchronize: true,
    }

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    StudentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
