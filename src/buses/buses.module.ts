import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusesService } from './buses.service';
import { BusesController } from './buses.controller';
import { Buses } from './entities/Buses';

@Module({
  imports: [TypeOrmModule.forFeature([Buses])],
  controllers: [BusesController],
  providers: [BusesService],
  exports: [BusesService],
})
export class BusesModule {}
