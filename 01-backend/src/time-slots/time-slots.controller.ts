import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateTimeSlotDto } from './dto/create-time-slot.dto';
import { UpdateTimeSlotDto } from './dto/update-time-slot.dto';
import { TimeSlotsService } from './time-slots.service';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
@Controller()
export class TimeSlotsController {
  constructor(private readonly timeSlotsService: TimeSlotsService) {}

  @Get('experiences/:experienceId/time-slots')
  @Public()
  findByExperience(
    @Param('experienceId', ParseUUIDPipe) experienceId: string,
  ) {
    return this.timeSlotsService.findByExperience(experienceId);
  }

  @Get('time-slots/:id')
  @Public()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.timeSlotsService.findOne(id);
  }

  @Post('experiences/:experienceId/time-slots')
  @Roles('OWNER')
  create(
    @Param('experienceId', ParseUUIDPipe) experienceId: string,
    @Body() createTimeSlotDto: CreateTimeSlotDto,
  ) {
    return this.timeSlotsService.create(experienceId, createTimeSlotDto);
  }

  @Patch('time-slots/:id')
  @Roles('OWNER')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTimeSlotDto: UpdateTimeSlotDto,
  ) {
    return this.timeSlotsService.update(id, updateTimeSlotDto);
  }
}
