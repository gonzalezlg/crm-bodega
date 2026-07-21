import {
  BadRequestException,
  Injectable,
  OnModuleDestroy,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService implements OnModuleDestroy {
  private readonly prisma = new PrismaClient();

  constructor(private readonly jwtService: JwtService) {}

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  async login(loginDto: LoginDto) {
    const identifier = loginDto.emailOrDni;

    if (!identifier || !loginDto.password) {
      throw new BadRequestException('Email o DNI y contraseña son obligatorios.');
    }

    const usuario = await this.prisma.usuario.findFirst({
      where: {
        OR: [{ email: identifier }, { dni: identifier }],
      },
      include: {
        rol: true,
      },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const passwordValida = await bcrypt.compare(
      loginDto.password,
      usuario.passwordHash,
    );

    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const rol = usuario.rol.nombre.toUpperCase();
    const payload = {
      sub: usuario.id,
      rol,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol,
      },
    };
  }
}
