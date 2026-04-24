import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RutaEstacionesService } from './ruta_estaciones.service';
import { CreateRutaEstacioneDto } from './dto/create-ruta_estacione.dto';
import { UpdateRutaEstacioneDto } from './dto/update-ruta_estacione.dto';

@Controller('ruta-estaciones')
export class RutaEstacionesController {
  constructor(private readonly rutaEstacionesService: RutaEstacionesService) {}

  @Post()
  create(@Body() createRutaEstacioneDto: CreateRutaEstacioneDto) {
    return this.rutaEstacionesService.create(createRutaEstacioneDto);
  }

  @Get()
  findAll() {
    return this.rutaEstacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rutaEstacionesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRutaEstacioneDto: UpdateRutaEstacioneDto) {
    return this.rutaEstacionesService.update(id, updateRutaEstacioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rutaEstacionesService.remove(id);
  }
}
