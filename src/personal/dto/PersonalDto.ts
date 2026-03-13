import { IsBoolean, IsOptional, IsDateString, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class PersonalDto {
  @IsString()
  IDE: string;
  
  @IsString()
  name: string;

  @IsString()
  lastname1: string;

  @IsString()
  lastname2: string;

  @IsString()
  birthDate: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsString()
  direction: string;

  @IsString()
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

  @IsNumber()
  UserId?: number;
}
