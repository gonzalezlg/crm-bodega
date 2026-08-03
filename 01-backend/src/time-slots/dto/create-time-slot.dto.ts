import { Type } from 'class-transformer';
import { Weekday } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateTimeSlotDto {
  @IsNotEmpty()
  @IsEnum(Weekday)
  weekday!: Weekday;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxPeople!: number;
}
