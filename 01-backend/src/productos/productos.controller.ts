import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { QueryProductosDto } from './dto/query-productos.dto';
import { UpdateProductoEstadoDto } from './dto/update-producto-estado.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { ProductosService } from './productos.service';

@Controller('api/productos')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Get()
  findAll(@Query() query: QueryProductosDto) {
    return this.productosService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(id);
  }

  @Post()
  create(@Body() createProductoDto: CreateProductoDto) {
    return this.productosService.create(createProductoDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductoDto: UpdateProductoDto,
  ) {
    return this.productosService.update(id, updateProductoDto);
  }

  @Patch(':id/estado')
  updateEstado(
    @Param('id') id: string,
    @Body() updateProductoEstadoDto: UpdateProductoEstadoDto,
  ) {
    return this.productosService.updateEstado(id, updateProductoEstadoDto);
  }
}
