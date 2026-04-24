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
import { CreateRutaDto } from './dto/create-ruta.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';
import { Rutas } from './entities/Rutas';
import { RutasService } from './rutas.service';

@ApiTags('rutas')
@Controller('rutas')
export class RutasController {
  constructor(private readonly rutasService: RutasService) {}

  @ApiOperation({ summary: 'Crear una nueva ruta' })
  @Post()
  create(@Body() createRutaDto: CreateRutaDto): Promise<BaseResponseDto<Rutas>> {
    return this.rutasService.create(createRutaDto);
  }

  @ApiOperation({ summary: 'Listar todas las rutas activas' })
  @Get()
  findAll(): Promise<BaseResponseDto<Rutas[]>> {
    return this.rutasService.findAll();
  }

  @ApiOperation({ summary: 'Buscar una ruta activa por codigo' })
  @ApiParam({ name: 'codigo', example: 'A' })
  @Get('codigo/:codigo')
  findByCodigo(
    @Param('codigo') codigo: string,
  ): Promise<BaseResponseDto<Rutas>> {
    return this.rutasService.findRutaByCodigo(codigo);
  }

  @ApiOperation({ summary: 'Buscar una ruta activa por id' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BaseResponseDto<Rutas>> {
    return this.rutasService.findOne(id);
  }

  @ApiOperation({ summary: 'Restaurar una ruta inactiva' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Patch(':id/restore')
  restore(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BaseResponseDto<Rutas>> {
    return this.rutasService.restore(id);
  }

  @ApiOperation({ summary: 'Actualizar una ruta activa por id' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateRutaDto: UpdateRutaDto,
  ): Promise<BaseResponseDto<Rutas>> {
    return this.rutasService.update(id, updateRutaDto);
  }

  @ApiOperation({ summary: 'Desactivar una ruta por id' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BaseResponseDto<Rutas>> {
    return this.rutasService.remove(id);
  }
}
