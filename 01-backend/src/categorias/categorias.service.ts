import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { ChangeCategoriaStatusDto } from './dto/change-categoria-status.dto';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService implements OnModuleDestroy {
  private readonly prisma = new PrismaClient();

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
  }

  async findAll(search?: string, activo?: string) {
    const where: Prisma.CategoriaWhereInput = {
      activo: this.parseActivo(activo),
    };

    const normalizedSearch = search?.trim();

    if (normalizedSearch) {
      where.nombre = {
        contains: normalizedSearch,
        mode: 'insensitive',
      };
    }

    return this.prisma.categoria.findMany({
      where,
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  async findOne(id: string) {
    return this.findCategoriaOrThrow(id);
  }

  async create(createCategoriaDto: CreateCategoriaDto) {
    const data = this.normalizeCategoriaData(createCategoriaDto);

    await this.ensureUniqueName(data.nombre);

    return this.prisma.categoria.create({
      data,
    });
  }

  async update(id: string, updateCategoriaDto: UpdateCategoriaDto) {
    await this.findCategoriaOrThrow(id);

    const data = this.normalizeCategoriaData(updateCategoriaDto);

    if (data.nombre) {
      await this.ensureUniqueName(data.nombre, id);
    }

    return this.prisma.categoria.update({
      where: { id },
      data,
    });
  }

  async changeStatus(
    id: string,
    changeCategoriaStatusDto: ChangeCategoriaStatusDto,
  ) {
    await this.findCategoriaOrThrow(id);

    return this.prisma.categoria.update({
      where: { id },
      data: { activo: changeCategoriaStatusDto.activo },
    });
  }

  private async findCategoriaOrThrow(id: string) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada.');
    }

    return categoria;
  }

  private parseActivo(activo?: string) {
    if (activo === undefined) {
      return true;
    }

    if (activo === 'true') {
      return true;
    }

    if (activo === 'false') {
      return false;
    }

    throw new BadRequestException(
      'El parámetro activo debe ser true o false.',
    );
  }

  private async ensureUniqueName(nombre: string, categoriaIdExcluir?: string) {
    const categoria = await this.prisma.categoria.findFirst({
      where: {
        id: categoriaIdExcluir ? { not: categoriaIdExcluir } : undefined,
        nombre: {
          equals: nombre,
          mode: 'insensitive',
        },
      },
    });

    if (categoria) {
      throw new ConflictException('Ya existe una categoría con el mismo nombre.');
    }
  }

  private normalizeCategoriaData<
    T extends CreateCategoriaDto | UpdateCategoriaDto,
  >(data: T) {
    return {
      ...data,
      nombre: data.nombre?.trim(),
      descripcion:
        data.descripcion === undefined
          ? undefined
          : data.descripcion.trim() || null,
    };
  }
}
