import { IsString } from "class-validator";

export class FaqDto {
  @IsString()
  question: string;
  @IsString()
  answer: string;
}
