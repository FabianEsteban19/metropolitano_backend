import { Module } from '@nestjs/common';
import { EstacionesService } from './estaciones.service';
import { EstacionesController } from './estaciones.controller';

@Module({
  controllers: [EstacionesController],
  providers: [EstacionesService],
})
export class EstacionesModule {}
