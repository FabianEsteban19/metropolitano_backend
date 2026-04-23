import { Module } from '@nestjs/common';
import { RutaEstacionesService } from './ruta_estaciones.service';
import { RutaEstacionesController } from './ruta_estaciones.controller';

@Module({
  controllers: [RutaEstacionesController],
  providers: [RutaEstacionesService],
})
export class RutaEstacionesModule {}
