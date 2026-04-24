import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstacionesService } from './estaciones.service';
import { EstacionesController } from './estaciones.controller';
import { Estaciones } from './entities/Estaciones';

@Module({
  imports: [TypeOrmModule.forFeature([Estaciones])],
  controllers: [EstacionesController],
  providers: [EstacionesService],
  exports: [EstacionesService],
})
export class EstacionesModule {}
