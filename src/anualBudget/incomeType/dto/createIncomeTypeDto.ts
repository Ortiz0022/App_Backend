// dto/createIncomeTypeDto.ts
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateIncomeTypeDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsNumber()
  departmentId: number;   // requerido
}
