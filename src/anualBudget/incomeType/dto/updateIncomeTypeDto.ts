// dto/updateIncomeTypeDto.ts
import { CreateIncomeTypeDto } from './createIncomeTypeDto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateIncomeTypeDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsNumber()
  departmentId?: number;  // mover a otro departamento (opcional)
}
