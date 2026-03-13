import { IsString } from "class-validator";

export class EventDto {
  @IsString()
  title: string;
  @IsString()
  date: string;
  @IsString()
  description: string;
  @IsString()
  illustration: string;
}
