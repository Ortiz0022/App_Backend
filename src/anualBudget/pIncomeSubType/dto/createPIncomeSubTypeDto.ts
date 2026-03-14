import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreatePIncomeSubTypeDto {
  @IsInt() pIncomeTypeId: number;
  @IsNotEmpty() 
  @IsString()
  name: string;
}