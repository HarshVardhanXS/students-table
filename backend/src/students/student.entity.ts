import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 120 })
  name: string

  @Column({ unique: true })
  email: string

  @Column('int')
  age: number
}
