import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdatePositionDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}
