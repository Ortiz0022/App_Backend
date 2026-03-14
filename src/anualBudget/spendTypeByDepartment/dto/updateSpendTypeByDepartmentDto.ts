import { IsNumber } from 'class-validator';

export class UpdateSpendTypeByDepartmentDto {
  @IsNumber()
  id_Department: number;
}
