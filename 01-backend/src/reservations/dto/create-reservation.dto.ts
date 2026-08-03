import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

function isRealDateString(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function IsRealDateString(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isRealDateString',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return isRealDateString(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a real date in YYYY-MM-DD format`;
        },
      },
    });
  };
}

export class CreateReservationDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  experienceId!: string;

  @IsNotEmpty()
  @IsString()
  @IsRealDateString()
  date!: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  peopleCount!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
