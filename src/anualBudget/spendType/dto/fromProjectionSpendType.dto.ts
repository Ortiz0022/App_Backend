import { IsInt } from 'class-validator';

export class FromProjectionSpendTypeDto {
  @IsInt()
  pSpendTypeId: number;
}
