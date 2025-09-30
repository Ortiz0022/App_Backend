import { IsArray, IsNotEmpty, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BenefitDto } from './benefit.dto';
import { RequirementDto } from './requirement.dto';


export class UpsertVolunteersPageDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  headerTitle: string;

  @IsString() @IsNotEmpty() @MaxLength(2000)
  headerDescription: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BenefitDto)
  benefits: BenefitDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequirementDto)
  requirements: RequirementDto[];
}
