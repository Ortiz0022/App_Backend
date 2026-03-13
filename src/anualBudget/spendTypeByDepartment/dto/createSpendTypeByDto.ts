import { IsNumber } from 'class-validator';

export class CreateSpendTypeByDepartmentDto {
  @IsNumber()
  id_Department: number; // crea (o asegura) la fila TOTAL del departamento
}
