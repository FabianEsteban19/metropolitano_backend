import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Buses } from 'src/buses/entities/Buses';
import { Rutas } from 'src/rutas/entities/Rutas';
import { ViajesController } from './viajes.controller';
import { Viajes } from './entities/Viajes';
import { ViajesService } from './viajes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Viajes, Rutas, Buses])],
  controllers: [ViajesController],
  providers: [ViajesService],
  exports: [ViajesService],
})
export class ViajesModule {}
