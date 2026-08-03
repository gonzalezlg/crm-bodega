import { Type } from 'class-transformer';
import { Weekday } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class UpdateTimeSlotDto {
  @IsOptional()
  @IsEnum(Weekday)
  weekday?: Weekday;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxPeople?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
