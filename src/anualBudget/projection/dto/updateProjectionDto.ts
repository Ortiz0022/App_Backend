import { IsNumberString, IsOptional } from 'class-validator';

export class UpdateProjectionDto {
  @IsOptional() @IsNumberString()
  total_amount?: string;
}
