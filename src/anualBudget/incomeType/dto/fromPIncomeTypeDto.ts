import { IsInt } from 'class-validator';

export class FromPIncomeTypeDto {
  @IsInt()
  pIncomeTypeId: number;
}
