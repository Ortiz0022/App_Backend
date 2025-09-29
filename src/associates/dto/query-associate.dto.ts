import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AssociateStatus } from './associate-status.enum';

export class QueryAssociateDto {
  @IsOptional() @IsEnum(AssociateStatus)
  status?: AssociateStatus;

  @IsOptional() @IsString()
  search?: string; // busca por nombre/apellidos/cedula/email
}
