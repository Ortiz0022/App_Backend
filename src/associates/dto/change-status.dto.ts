import { IsEnum } from 'class-validator';
import { AssociateStatus } from './associate-status.enum';

export class ChangeStatusDto {
  @IsEnum(AssociateStatus)
  estado: AssociateStatus;
}
