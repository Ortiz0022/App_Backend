import { BenefitDto } from './benefit.dto';
import { RequirementDto } from './requirement.dto';

export class AssociatesPageResponse {
  id: string;
  headerTitle: string;
  headerDescription: string;
  benefits: BenefitDto[];
  requirements: RequirementDto[];
}
