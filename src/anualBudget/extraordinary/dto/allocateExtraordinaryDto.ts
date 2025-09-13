import { IsNumber, IsPositive } from 'class-validator';

export class AllocateExtraordinaryDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number; // amount to consume from the extraordinary balance
}