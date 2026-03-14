import { IsString, IsNumber } from "class-validator";

export class PrincipalDto{
  @IsString()
    title: string;
  @IsString()
    description: string;
  @IsNumber()
    eventId: number;
  }