import { IsInt } from 'class-validator';

export class FromProjectionSpendSubTypeDto {
  @IsInt()
  pSpendSubTypeId: number;
}
