import { IsEnum, IsInt, IsNumberString, IsOptional, Min } from 'class-validator';


export class CreateProjectionDto {
  @IsInt() @Min(1)
  fiscalYearId: number;

  @IsOptional() @IsNumberString()
  total_amount?: string;

}
