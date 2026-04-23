import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EstacionesService } from './estaciones.service';
import { CreateEstacioneDto } from './dto/create-estacione.dto';
import { UpdateEstacioneDto } from './dto/update-estacione.dto';

@Controller('estaciones')
export class EstacionesController {
  constructor(private readonly estacionesService: EstacionesService) {}

  @Post()
  create(@Body() createEstacioneDto: CreateEstacioneDto) {
    return this.estacionesService.create(createEstacioneDto);
  }

  @Get()
  findAll() {
    return this.estacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estacionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEstacioneDto: UpdateEstacioneDto) {
    return this.estacionesService.update(+id, updateEstacioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estacionesService.remove(+id);
  }
}
