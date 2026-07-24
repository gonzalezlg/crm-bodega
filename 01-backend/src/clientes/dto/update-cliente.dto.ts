import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateClienteDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  ubicacion?: string | null;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  observaciones?: string;
}