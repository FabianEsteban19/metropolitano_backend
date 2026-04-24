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
import { Public } from 'src/auth/public.decorator';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { CreateEstacioneDto } from './dto/create-estacione.dto';
import { UpdateEstacioneDto } from './dto/update-estacione.dto';
import { Estaciones } from './entities/Estaciones';
import { EstacionesService } from './estaciones.service';

@ApiTags('estaciones')
@Controller('estaciones')
export class EstacionesController {
  constructor(private readonly estacionesService: EstacionesService) {}

  @ApiOperation({ summary: 'Crear una nueva estacion' })
  @Post()
  create(
    @Body() createEstacioneDto: CreateEstacioneDto,
  ): Promise<BaseResponseDto<Estaciones>> {
    return this.estacionesService.create(createEstacioneDto);
  }

  @ApiOperation({ summary: 'Listar todas las estaciones activas' })
  @Public()
  @Get()
  findAll(): Promise<BaseResponseDto<Estaciones[]>> {
    return this.estacionesService.findAll();
  }

  @ApiOperation({ summary: 'Buscar una estacion activa por id' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BaseResponseDto<Estaciones>> {
    return this.estacionesService.findOne(id);
  }

  @ApiOperation({ summary: 'Restaurar una estacion inactiva' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Patch(':id/restore')
  restore(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BaseResponseDto<Estaciones>> {
    return this.estacionesService.restore(id);
  }

  @ApiOperation({ summary: 'Actualizar una estacion activa por id' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateEstacioneDto: UpdateEstacioneDto,
  ): Promise<BaseResponseDto<Estaciones>> {
    return this.estacionesService.update(id, updateEstacioneDto);
  }

  @ApiOperation({ summary: 'Desactivar una estacion por id' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BaseResponseDto<Estaciones>> {
    return this.estacionesService.remove(id);
  }
}
