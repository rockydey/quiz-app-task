import { IsDateString, IsInt, IsString, Min, MinLength } from "class-validator";

export class CreateQuizDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsDateString()
  date!: string; // ISO string

  @IsInt()
  @Min(1)
  durationMin!: number;

  @IsString()
  positionId!: string;
}
