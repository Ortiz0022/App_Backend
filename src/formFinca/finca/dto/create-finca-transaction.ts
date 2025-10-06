import { IsString, MaxLength } from 'class-validator';

export class CreateFincaTransactionDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @MaxLength(20)
  areaHa: string;

  @IsString()
  @MaxLength(50)
  numeroPlano: string;
}