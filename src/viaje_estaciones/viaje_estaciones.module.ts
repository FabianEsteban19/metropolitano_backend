import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estaciones } from 'src/estaciones/entities/Estaciones';
import { Viajes } from 'src/viajes/entities/Viajes';
import { ViajeEstacionesController } from './viaje_estaciones.controller';
import { ViajeEstaciones } from './entities/ViajeEstaciones';
import { ViajeEstacionesService } from './viaje_estaciones.service';

@Module({
  imports: [TypeOrmModule.forFeature([ViajeEstaciones, Viajes, Estaciones])],
  controllers: [ViajeEstacionesController],
  providers: [ViajeEstacionesService],
  exports: [ViajeEstacionesService],
})
export class ViajeEstacionesModule {}
