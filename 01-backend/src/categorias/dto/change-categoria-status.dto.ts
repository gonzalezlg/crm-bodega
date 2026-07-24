import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ChangeCategoriaStatusDto {
  @IsNotEmpty()
  @IsBoolean()
  activo!: boolean;
}
