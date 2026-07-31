import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { AvailabilityService } from './availability.service';

@Controller('experiences/:experienceId/availability')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  @Roles('OWNER')
  findByExperienceAndDate(
    @Param('experienceId', ParseUUIDPipe) experienceId: string,
    @Query('date') date: string,
  ) {
    return this.availabilityService.getAvailability(experienceId, date);
  }
}
