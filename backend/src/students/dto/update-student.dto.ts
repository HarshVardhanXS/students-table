import { IsEmail, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  age?: number
}
