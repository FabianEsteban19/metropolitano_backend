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
import { RutasService } from './rutas.service';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { Rutas } from './entities/Rutas';

@ApiTags('rutas')
@Controller('rutas')
export class RutasController {
  constructor(private readonly rutasService: RutasService) {}

  @ApiOperation({ summary: 'Crear una nueva ruta' })
  @Post()
  create(@Body() createRutaDto: CreateRutaDto): Promise<BaseResponseDto<Rutas>> {
    return this.rutasService.create(createRutaDto);
  }

  @ApiOperation({ summary: 'Listar todas las rutas' })
  @Get()
  findAll(): Promise<BaseResponseDto<Rutas[]>> {
    return this.rutasService.findAll();
  }

  @ApiOperation({ summary: 'Buscar una ruta por codigo' })
  @ApiParam({ name: 'codigo', example: 'A' })
  @Get('codigo/:codigo')
  findByCodigo(
    @Param('codigo') codigo: string,
  ): Promise<BaseResponseDto<Rutas>> {
    return this.rutasService.findRutaByCodigo(codigo);
  }

  @ApiOperation({ summary: 'Buscar una ruta por codigo' })
  @ApiParam({
    name: 'codigo',
    example: 'A'
  })
  @Get('codigo/:codigo')
  findOne(
    @Param('codigo') codigo: string,
  ): Promise<BaseResponseDto<Rutas>> {
    return this.rutasService.findOne(codigo);
  }

  @ApiOperation({ summary: 'Actualizar una ruta por id' })
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

  @ApiOperation({ summary: 'Eliminar una ruta por id' })
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
