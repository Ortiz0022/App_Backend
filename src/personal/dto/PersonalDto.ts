import { IsBoolean, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class PersonalDto {
  IDE: string;
  name: string;
  lastname1: string;
  lastname2: string;
  birthDate: string;
  phone: string;
  email: string;
  direction: string;
  occupation: string;
  @IsBoolean()
  @Type(() => Boolean)
  isActive: boolean;
  @IsOptional()
  @IsDateString()            //YYYY-MM-DD
  startWorkDate?: string;
  @IsOptional()
  @IsDateString()            
  endWorkDate?: string | null;

  UserId?: number;
}
