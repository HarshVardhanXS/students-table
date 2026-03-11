import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateStudentDto } from './dto/create-student.dto'
import { UpdateStudentDto } from './dto/update-student.dto'
import { Student } from './student.entity'

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  findAll() {
    return this.studentsRepository.find({ order: { name: 'ASC' } })
  }

  async findOne(id: string) {
    const student = await this.studentsRepository.findOne({ where: { id } })
    if (!student) throw new NotFoundException('Student not found')
    return student
  }

  async create(payload: CreateStudentDto) {
    const student = this.studentsRepository.create(payload)
    return this.studentsRepository.save(student)
  }

  async update(id: string, payload: UpdateStudentDto) {
    const student = await this.findOne(id)
    const updated = this.studentsRepository.merge(student, payload)
    return this.studentsRepository.save(updated)
  }

  async remove(id: string) {
    const student = await this.findOne(id)
    await this.studentsRepository.remove(student)
  }
}
