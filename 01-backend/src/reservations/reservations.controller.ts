import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ListReservationsDto } from './dto/list-reservations.dto';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @Roles('OWNER')
  findAll(@Query() query: ListReservationsDto) {
    return this.reservationsService.findAll(query);
  }

  @Post()
  @Roles('OWNER')
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Patch(':id/cancel')
  @Roles('OWNER')
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.cancel(id);
  }

  @Patch(':id/confirm')
  @Roles('OWNER')
  confirm(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.confirm(id);
  }

  @Patch(':id/attend')
  @Roles('OWNER')
  attend(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.attend(id);
  }

  @Patch(':id/no-show')
  @Roles('OWNER')
  noShow(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.noShow(id);
  }
}
