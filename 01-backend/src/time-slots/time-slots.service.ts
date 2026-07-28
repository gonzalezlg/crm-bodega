import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimeSlotDto } from './dto/create-time-slot.dto';
import { UpdateTimeSlotDto } from './dto/update-time-slot.dto';

@Injectable()
export class TimeSlotsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByExperience(experienceId: string) {
    await this.findExperienceOrThrow(experienceId);

    return this.prisma.timeSlot.findMany({
      where: { experienceId },
      orderBy: [
        {
          weekday: 'asc',
        },
        {
          startTime: 'asc',
        },
      ],
    });
  }

  async findOne(id: string) {
    return this.findTimeSlotOrThrow(id);
  }

  async create(experienceId: string, createTimeSlotDto: CreateTimeSlotDto) {
    await this.findExperienceOrThrow(experienceId);

    try {
      return await this.prisma.timeSlot.create({
        data: {
          ...createTimeSlotDto,
          experienceId,
        },
      });
    } catch (error) {
      this.handlePrismaUniqueError(error);
      throw error;
    }
  }

  async update(id: string, updateTimeSlotDto: UpdateTimeSlotDto) {
    await this.findTimeSlotOrThrow(id);

    try {
      return await this.prisma.timeSlot.update({
        where: { id },
        data: updateTimeSlotDto,
      });
    } catch (error) {
      this.handlePrismaUniqueError(error);
      throw error;
    }
  }

  private async findExperienceOrThrow(id: string) {
    const experience = await this.prisma.experience.findUnique({
      where: { id },
    });

    if (!experience) {
      throw new NotFoundException('Experiencia no encontrada.');
    }

    return experience;
  }

  private async findTimeSlotOrThrow(id: string) {
    const timeSlot = await this.prisma.timeSlot.findUnique({
      where: { id },
    });

    if (!timeSlot) {
      throw new NotFoundException('Franja horaria no encontrada.');
    }

    return timeSlot;
  }

  private handlePrismaUniqueError(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'Ya existe una franja horaria para esta experiencia, día y hora.',
      );
    }
  }
}
