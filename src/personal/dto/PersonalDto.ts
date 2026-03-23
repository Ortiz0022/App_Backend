import {
  IsBoolean,
  IsOptional,
  IsDateString,
  IsString,
  IsNumber,
} from 'class-validator';
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

  @IsDateString()
  birthDate: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  direction?: string;

  @IsString()
  occupation: string;

  @IsBoolean()
  @Type(() => Boolean)
  isActive: boolean;

  @IsOptional()
  @IsDateString()
  startWorkDate?: string;

  @IsOptional()
  @IsDateString()
  endWorkDate?: string | null;

  @IsOptional()
  @IsNumber()
  userId?: number;
}