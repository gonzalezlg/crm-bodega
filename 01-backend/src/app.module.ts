import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/guards/auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { CategoriasModule } from './categorias/categorias.module';
import { ClientesModule } from './clientes/clientes.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { ProductosModule } from './productos/productos.module';
import { TimeSlotsModule } from './time-slots/time-slots.module';

@Module({
  imports: [
    AuthModule,
    ClientesModule,
    CategoriasModule,
    ProductosModule,
    ExperiencesModule,
    TimeSlotsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
