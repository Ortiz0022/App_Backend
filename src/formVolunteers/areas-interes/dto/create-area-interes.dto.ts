import {
  IsString,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreateAreaInteresDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombreArea: string;
}