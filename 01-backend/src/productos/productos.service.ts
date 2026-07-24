import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common';
import { Categoria, Prisma, PrismaClient } from '@prisma/client';
import { CreateProductoDto } from './dto/create-producto.dto';
import { GetProductosQueryDto } from './dto/query-productos.dto';
import { UpdateProductoEstadoDto } from './dto/update-producto-estado.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService implements OnModuleDestroy {
  private readonly prisma = new PrismaClient();

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
  }

  async findAll(query: GetProductosQueryDto) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.ProductoWhereInput = {};

    if (query.categoriaId !== undefined) {
      where.categoriaId = query.categoriaId;
    }

    if (query.activo !== undefined) {
      where.activo = query.activo;
    }

    if (query.search) {
      where.nombre = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    const [productos, total] = await this.prisma.$transaction([
      this.prisma.producto.findMany({
        where,
        include: {
          categoria: true,
        },
        orderBy: {
          nombre: 'asc',
        },
        skip,
        take: limit,
      }),
      this.prisma.producto.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: productos,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasPrevious: page > 1,
        hasNext: page < totalPages,
      },
    };
  }

  async findOne(id: string) {
    return this.findProductoOrThrow(id);
  }

  async create(createProductoDto: CreateProductoDto) {
    const data = this.normalizeProductoData(createProductoDto);

    await this.findCategoriaActivaOrThrow(data.categoriaId);
    await this.ensureUniqueNameByCategoria(data.nombre, data.categoriaId);

    try {
      return await this.prisma.producto.create({
        data,
        include: {
          categoria: true,
        },
      });
    } catch (error) {
      this.handlePrismaUniqueError(error);
      throw error;
    }
  }

  async update(id: string, updateProductoDto: UpdateProductoDto) {
    const productoActual = await this.findProductoOrThrow(id);
    const data = this.normalizeProductoData(updateProductoDto);
    const categoriaIdFinal = data.categoriaId ?? productoActual.categoriaId;
    const nombreFinal = data.nombre ?? productoActual.nombre;

    await this.findCategoriaActivaOrThrow(categoriaIdFinal);
    await this.ensureUniqueNameByCategoria(nombreFinal, categoriaIdFinal, id);

    try {
      return await this.prisma.producto.update({
        where: { id },
        data,
        include: {
          categoria: true,
        },
      });
    } catch (error) {
      this.handlePrismaUniqueError(error);
      throw error;
    }
  }

  async updateEstado(
    id: string,
    updateProductoEstadoDto: UpdateProductoEstadoDto,
  ) {
    await this.findProductoOrThrow(id);

    return this.prisma.producto.update({
      where: { id },
      data: { activo: updateProductoEstadoDto.activo },
      include: {
        categoria: true,
      },
    });
  }

  private async findProductoOrThrow(id: string) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: {
        categoria: true,
      },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado.');
    }

    return producto;
  }

  private async findCategoriaActivaOrThrow(
    categoriaId: string,
  ): Promise<Categoria> {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id: categoriaId },
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada.');
    }

    if (!categoria.activo) {
      throw new BadRequestException('La categoría seleccionada está inactiva.');
    }

    return categoria;
  }

  private async ensureUniqueNameByCategoria(
    nombre: string,
    categoriaId: string,
    productoIdExcluir?: string,
  ) {
    const producto = await this.prisma.producto.findFirst({
      where: {
        id: productoIdExcluir ? { not: productoIdExcluir } : undefined,
        categoriaId,
        nombre: {
          equals: nombre,
          mode: 'insensitive',
        },
      },
    });

    if (producto) {
      throw new ConflictException(
        'Ya existe un producto con el mismo nombre en esta categoría.',
      );
    }
  }

  private normalizeProductoData<T extends CreateProductoDto | UpdateProductoDto>(
    data: T,
  ) {
    return {
      ...data,
      nombre: data.nombre?.trim().replace(/\s+/g, ' '),
      descripcion:
        data.descripcion === undefined
          ? undefined
          : data.descripcion.trim() || null,
    };
  }

  private handlePrismaUniqueError(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'Ya existe un producto con el mismo nombre en esta categoría.',
      );
    }
  }
}
