import { IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class UpdateFincaDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  areaHa?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  numeroPlano?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  idCorriente?: number;
}
