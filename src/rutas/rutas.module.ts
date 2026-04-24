import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RutasService } from './rutas.service';
import { RutasController } from './rutas.controller';
import { Rutas } from './entities/Rutas';

@Module({
  imports: [TypeOrmModule.forFeature([Rutas])],
  controllers: [RutasController],
  providers: [RutasService],
  exports: [RutasService],
})
export class RutasModule {}
