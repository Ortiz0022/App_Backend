import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class AssignExtraordinaryDto {
  @IsInt()
  extraordinaryId: number;

  @IsPositive()
  amount: number;

  @IsInt()
  departmentId: number;

  @IsString()
  @IsNotEmpty()
  subTypeName: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsInt()
  @IsPositive()
  fiscalYearId: number;
}