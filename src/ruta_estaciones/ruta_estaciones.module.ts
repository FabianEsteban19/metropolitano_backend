import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estaciones } from 'src/estaciones/entities/Estaciones';
import { Rutas } from 'src/rutas/entities/Rutas';
import { RutaEstacionesService } from './ruta_estaciones.service';
import { RutaEstacionesController } from './ruta_estaciones.controller';
import { RutaEstaciones } from './entities/RutaEstaciones';

@Module({
  imports: [TypeOrmModule.forFeature([RutaEstaciones, Rutas, Estaciones])],
  controllers: [RutaEstacionesController],
  providers: [RutaEstacionesService],
})
export class RutaEstacionesModule {}
