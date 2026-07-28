import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AvailabilityExceptionType, Weekday } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AvailableSlotDto } from './dto/available-slot.dto';
import { AvailabilityResultDto } from './dto/availability-result.dto';

type ParsedDate = {
  date: Date;
  weekday: Weekday;
};

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailability(
    experienceId: string,
    date: string,
  ): Promise<AvailabilityResultDto> {
    const parsedDate = this.parseDate(date);

    await this.findExperienceOrThrow(experienceId);

    const timeSlots = await this.prisma.timeSlot.findMany({
      where: {
        experienceId,
        weekday: parsedDate.weekday,
        active: true,
      },
      select: {
        startTime: true,
        maxPeople: true,
      },
    });

    const slotsByStartTime = new Map<string, AvailableSlotDto>();

    for (const timeSlot of timeSlots) {
      slotsByStartTime.set(timeSlot.startTime, {
        startTime: timeSlot.startTime,
        capacity: timeSlot.maxPeople,
        available: timeSlot.maxPeople,
      });
    }

    const exceptions = await this.prisma.availabilityException.findMany({
      where: {
        experienceId,
        date: parsedDate.date,
        active: true,
      },
      select: {
        startTime: true,
        type: true,
        capacity: true,
      },
    });

    for (const exception of exceptions) {
      if (exception.type === AvailabilityExceptionType.CLOSED) {
        slotsByStartTime.delete(exception.startTime);
        continue;
      }

      if (exception.type === AvailabilityExceptionType.CAPACITY_OVERRIDE) {
        const capacity = this.getValidExceptionCapacity(exception.capacity);

        if (slotsByStartTime.has(exception.startTime)) {
          slotsByStartTime.set(exception.startTime, {
            startTime: exception.startTime,
            capacity,
            available: capacity,
          });
        }

        continue;
      }

      if (exception.type === AvailabilityExceptionType.EXTRA_SLOT) {
        const capacity = this.getValidExceptionCapacity(exception.capacity);

        slotsByStartTime.set(exception.startTime, {
          startTime: exception.startTime,
          capacity,
          available: capacity,
        });
      }
    }

    const slots = Array.from(slotsByStartTime.values()).sort((a, b) =>
      a.startTime.localeCompare(b.startTime),
    );

    return {
      experienceId,
      date,
      slots,
    };
  }

  private async findExperienceOrThrow(id: string) {
    const experience = await this.prisma.experience.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

    if (!experience) {
      throw new NotFoundException('Experiencia no encontrada.');
    }

    return experience;
  }

  private parseDate(date: string): ParsedDate {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

    if (!match) {
      throw new BadRequestException('Fecha invalida.');
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const parsedDate = new Date(Date.UTC(year, month - 1, day));

    if (
      parsedDate.getUTCFullYear() !== year ||
      parsedDate.getUTCMonth() !== month - 1 ||
      parsedDate.getUTCDate() !== day
    ) {
      throw new BadRequestException('Fecha invalida.');
    }

    return {
      date: parsedDate,
      weekday: this.getWeekday(parsedDate),
    };
  }

  private getWeekday(date: Date): Weekday {
    const weekdays: Weekday[] = [
      Weekday.SUNDAY,
      Weekday.MONDAY,
      Weekday.TUESDAY,
      Weekday.WEDNESDAY,
      Weekday.THURSDAY,
      Weekday.FRIDAY,
      Weekday.SATURDAY,
    ];

    return weekdays[date.getUTCDay()];
  }

  private getValidExceptionCapacity(capacity: number | null): number {
    if (capacity === null || capacity < 1) {
      throw new InternalServerErrorException(
        'La configuracion de disponibilidad es invalida.',
      );
    }

    return capacity;
  }
}
