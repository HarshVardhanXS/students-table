import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common'
import { CreateStudentDto } from './dto/create-student.dto'
import { UpdateStudentDto } from './dto/update-student.dto'
import { StudentsService } from './students.service'

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  private wrap<T>(data: T, meta: Record<string, unknown> = {}) {
    return { data, meta }
  }

  @Get()
  async findAll() {
    const data = await this.studentsService.findAll()
    return this.wrap(data, { count: data.length })
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.studentsService.findOne(id)
    return this.wrap(data)
  }

  @Post()
  async create(@Body() payload: CreateStudentDto) {
    const data = await this.studentsService.create(payload)
    return this.wrap(data, { message: 'Student created' })
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateStudentDto) {
    const data = await this.studentsService.update(id, payload)
    return this.wrap(data, { message: 'Student updated' })
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.studentsService.remove(id)
    return this.wrap(null, { message: 'Student deleted' })
  }
}
