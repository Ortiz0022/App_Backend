import { BenefitDto } from "./benefit.dto";
import { RequirementDto } from "./requirement.dto";
import { IsArray, IsString } from "class-validator";


export class VolunteersPageResponse {
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
