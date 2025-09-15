// src/anualBudget/extraordinary/dto/assign-extraordinary.dto.ts
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class AssignExtraordinaryDto {
  @IsInt()
  extraordinaryId: number;   // Id del extraordinary

  @IsPositive()
  amount: number;            // Monto a trasladar

  @IsInt()
  departmentId: number;      // Depto al que cae el ingreso

  @IsString()
  @IsNotEmpty()
  subTypeName: string;       // Ej: "Donación Anónima"

  date?: string;             // Fecha opcional (si no, hoy)
}
