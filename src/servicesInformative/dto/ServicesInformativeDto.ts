import { IsArray, IsNotEmpty, IsString, ArrayMinSize } from "class-validator";

export class ServicesInformativeDto {

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  cardDescription: string;

  @IsString()
  @IsNotEmpty()
  modalDescription: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  images: string[];

}