import { IsEmail, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator'

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEmail()
  email: string

  @IsInt()
  @Min(1)
  @Max(120)
  age: number
}
