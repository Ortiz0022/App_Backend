import { IsBoolean, IsString } from "class-validator";

export class VolunteerDto {
  @IsString()
  IDE: string;

  @IsString()
  name: string;

  @IsString()
  lastName1: string;

  @IsString()
  lastName2: string;

  @IsString()
  birthDate: string;

  @IsString()
  phone: string;
  
  @IsString()
  email: string;
  
  @IsString()
  address: string;
  
  @IsString()
  community: string;
  
  @IsString()
  volunteeringType: string;
  
  @IsString()
  availability: string;
  
  @IsString()
  previousExperience: string;
  
  @IsString()
  motivation: string;
  
  @IsBoolean()
  acceptTerms: boolean;
  
  @IsBoolean()
  receiveInfo: boolean;
}
