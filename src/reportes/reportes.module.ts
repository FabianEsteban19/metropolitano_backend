import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Buses } from 'src/buses/entities/Buses';
import { Estaciones } from 'src/estaciones/entities/Estaciones';
import { RutaEstaciones } from 'src/ruta_estaciones/entities/RutaEstaciones';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { Reportes } from './entities/Reportes';

@Module({
  imports: [TypeOrmModule.forFeature([Reportes, Buses, Estaciones, RutaEstaciones])],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
