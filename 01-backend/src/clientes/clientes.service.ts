import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common';
import { Cliente, Prisma, PrismaClient } from '@prisma/client';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

type DuplicateWarning = {
  campo: 'email' | 'telefono';
  mensaje: string;
  clientes: Pick<
    Cliente,
    'id' | 'nombre' | 'apellido' | 'email' | 'telefono'
  >[];
};

@Injectable()
export class ClientesService implements OnModuleDestroy {
  private readonly prisma = new PrismaClient();

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
  }

  async findAll(search?: string, activo?: string) {
    const where: Prisma.ClienteWhereInput = {
      activo: this.parseActivo(activo),
    };

    const normalizedSearch = search?.trim();

    if (normalizedSearch) {
      where.OR = [
        { nombre: { contains: normalizedSearch, mode: 'insensitive' } },
        { apellido: { contains: normalizedSearch, mode: 'insensitive' } },
        { telefono: { contains: normalizedSearch, mode: 'insensitive' } },
        { email: { contains: normalizedSearch, mode: 'insensitive' } },
      ];
    }

    return this.prisma.cliente.findMany({
      where,
      orderBy: [
        {
          apellido: 'asc',
        },
        {
          nombre: 'asc',
        },
      ],
    });
  }

  async findOne(id: string) {
    return this.findClienteOrThrow(id);
  }

  async create(createClienteDto: CreateClienteDto) {
    const advertencias =
      await this.findDuplicateWarnings(createClienteDto);

    const cliente = await this.prisma.cliente.create({
      data: createClienteDto,
    });

    return {
      cliente,
      advertencias,
    };
  }

  async update(id: string, updateClienteDto: UpdateClienteDto) {
    const clienteActual = await this.findClienteOrThrow(id);

    const advertencias = await this.findDuplicateWarnings(
      {
        email: updateClienteDto.email ?? clienteActual.email,
        telefono: updateClienteDto.telefono ?? clienteActual.telefono,
      },
      id,
    );

    const cliente = await this.prisma.cliente.update({
      where: { id },
      data: updateClienteDto,
    });

    return {
      cliente,
      advertencias,
    };
  }

  async desactivar(id: string) {
    const cliente = await this.findClienteOrThrow(id);

    if (!cliente.activo) {
      return cliente;
    }

    return this.prisma.cliente.update({
      where: { id },
      data: { activo: false },
    });
  }

  private async findClienteOrThrow(id: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado.');
    }

    return cliente;
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
      'El parametro activo debe ser true o false.',
    );
  }

  private async findDuplicateWarnings(
    datos: Pick<CreateClienteDto, 'email' | 'telefono'>,
    clienteIdExcluir?: string,
  ): Promise<DuplicateWarning[]> {
    const duplicates = await this.prisma.cliente.findMany({
      where: {
        id: clienteIdExcluir ? { not: clienteIdExcluir } : undefined,
        OR: [{ email: datos.email }, { telefono: datos.telefono }],
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
      },
    });

    const warnings: DuplicateWarning[] = [];

    const sameEmail = duplicates.filter(
      (cliente) => cliente.email === datos.email,
    );

    const samePhone = duplicates.filter(
      (cliente) => cliente.telefono === datos.telefono,
    );

    if (sameEmail.length > 0) {
      warnings.push({
        campo: 'email',
        mensaje: 'Ya existen clientes registrados con el mismo email.',
        clientes: sameEmail,
      });
    }

    if (samePhone.length > 0) {
      warnings.push({
        campo: 'telefono',
        mensaje: 'Ya existen clientes registrados con el mismo telefono.',
        clientes: samePhone,
      });
    }

    return warnings;
  }
}