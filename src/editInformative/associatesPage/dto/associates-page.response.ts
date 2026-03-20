import { IsArray, IsString } from "class-validator";
import { BenefitDto } from './benefit.dto';
import { RequirementDto } from './requirement.dto';

export class AssociatesPageResponse { 
  @IsString()
  id: string;
  @IsString()
  headerTitle: string;
  @IsString()
  headerDescription: string;
  @IsArray()
  benefits: BenefitDto[];
  @IsArray()
  requirements: RequirementDto[];
}
