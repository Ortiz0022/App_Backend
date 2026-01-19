import { IsInt } from 'class-validator';

export class FromPIncomeSubTypeDto {
  @IsInt()
  pIncomeSubTypeId: number;
}
