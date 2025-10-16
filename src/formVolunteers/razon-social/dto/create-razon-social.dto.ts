import {
  IsString,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreateRazonSocialDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  razonSocial: string;
}