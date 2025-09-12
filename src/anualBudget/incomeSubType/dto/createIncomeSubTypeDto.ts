import { IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateIncomeSubTypeDto {
  @IsString() @IsNotEmpty()
  name: string;

  // viene como string porque la columna es DECIMAL
  @IsNumberString()
  amount: string;           // ej: "12345.67"

  @IsOptional() @IsString()
  date?: string;            // ISO; si no viene -> now()

  @IsNumberString()
  incomeTypeId: number;     // FK
}
