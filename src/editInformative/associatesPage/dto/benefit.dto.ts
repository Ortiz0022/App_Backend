import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class BenefitDto {
  @IsString() @IsNotEmpty() @MaxLength(50)
  iconName: string; // 'Users' | 'Heart' | 'Award' | ...

  @IsString() @IsNotEmpty() @MaxLength(120)
  title: string;

  @IsString() @IsNotEmpty() @MaxLength(1000)
  desc: string;

  @IsInt() @IsOptional()
  order?: number;
}
