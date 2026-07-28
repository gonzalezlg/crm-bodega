import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';

@Injectable()
export class ExperiencesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.experience.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.findExperienceOrThrow(id);
  }

  async create(createExperienceDto: CreateExperienceDto) {
    return this.prisma.experience.create({
      data: createExperienceDto,
    });
  }

  async update(id: string, updateExperienceDto: UpdateExperienceDto) {
    await this.findExperienceOrThrow(id);

    return this.prisma.experience.update({
      where: { id },
      data: updateExperienceDto,
    });
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
}
