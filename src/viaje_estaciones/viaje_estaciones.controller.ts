import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { CreateViajeEstacionDto } from './dto/create-viaje-estacion.dto';
import { UpdateViajeEstacionDto } from './dto/update-viaje-estacion.dto';
import { ViajeEstaciones } from './entities/ViajeEstaciones';
import { ViajeEstacionesService } from './viaje_estaciones.service';

@ApiTags('viaje-estaciones')
@Controller('viaje-estaciones')
export class ViajeEstacionesController {
  constructor(
    private readonly viajeEstacionesService: ViajeEstacionesService,
  ) {}

  @ApiOperation({ summary: 'Crear una parada operativa de un viaje' })
  @Post()
  create(
    @Body() createViajeEstacionDto: CreateViajeEstacionDto,
  ): Promise<BaseResponseDto<ViajeEstaciones>> {
    return this.viajeEstacionesService.create(createViajeEstacionDto);
  }

  @ApiOperation({ summary: 'Listar paradas activas de viajes' })
  @Get()
  findAll(): Promise<BaseResponseDto<ViajeEstaciones[]>> {
    return this.viajeEstacionesService.findAll();
  }

  @ApiOperation({ summary: 'Obtener una parada activa por id' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440020',
  })
  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BaseResponseDto<ViajeEstaciones>> {
    return this.viajeEstacionesService.findOne(id);
  }

  @ApiOperation({ summary: 'Restaurar una parada inactiva' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440020',
  })
  @Patch(':id/restore')
  restore(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BaseResponseDto<ViajeEstaciones>> {
    return this.viajeEstacionesService.restore(id);
  }

  @ApiOperation({ summary: 'Actualizar una parada activa por id' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440020',
  })
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateViajeEstacionDto: UpdateViajeEstacionDto,
  ): Promise<BaseResponseDto<ViajeEstaciones>> {
    return this.viajeEstacionesService.update(id, updateViajeEstacionDto);
  }

  @ApiOperation({ summary: 'Desactivar una parada operativa por id' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440020',
  })
  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BaseResponseDto<ViajeEstaciones>> {
    return this.viajeEstacionesService.remove(id);
  }
}
