import { IsInt, IsNotEmpty } from 'class-validator';

export class CreatePIncomeSubTypeDto {
  @IsInt() pIncomeTypeId: number;
  @IsNotEmpty() name: string;
}