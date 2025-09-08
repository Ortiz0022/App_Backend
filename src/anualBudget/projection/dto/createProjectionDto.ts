import { IsEnum, IsInt, IsNumberString, IsOptional, Min } from 'class-validator';
import { ProjectionState } from '../entities/projection.entity';


export class CreateProjectionDto {
  @IsInt()
  @Min(2000)
  year: number;

  // opcional; si no viene, queda en 0.00
  @IsOptional()
  @IsNumberString()
  total_amount?: string;

  @IsOptional()
  @IsEnum(ProjectionState)
  state?: ProjectionState;
}
