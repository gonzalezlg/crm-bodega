import { Controller, Get } from '@nestjs/common';
import { Roles } from './auth/decorators/roles.decorator';

@Controller()
export class AppController {
  @Get('health')
  @Roles('OWNER')
  getHealth() {
    return {
      status: 'ok',
    };
  }
}
