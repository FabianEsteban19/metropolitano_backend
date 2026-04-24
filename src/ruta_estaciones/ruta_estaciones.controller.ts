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
import { RutaEstacionesService } from './ruta_estaciones.service';
import { CreateRutaEstacioneDto } from './dto/create-ruta_estacione.dto';
import { CreateRutaEstacionesLoteDto } from './dto/create-ruta-estaciones-lote.dto';
import { UpdateRutaEstacioneDto } from './dto/update-ruta_estacione.dto';
import { RutaEstaciones } from './entities/RutaEstaciones';

@ApiTags('ruta-estaciones')
@Controller('ruta-estaciones')
export class RutaEstacionesController {
  constructor(private readonly rutaEstacionesService: RutaEstacionesService) {}

  @ApiOperation({ summary: 'Crear una relacion activa entre ruta y estacion' })
  @Post()
  create(
    @Body() createRutaEstacioneDto: CreateRutaEstacioneDto,
  ): Promise<BaseResponseDto<RutaEstaciones>> {
    return this.rutaEstacionesService.create(createRutaEstacioneDto);
  }

  @ApiOperation({
    summary:
      'Crear en lote las estaciones de una ruta dentro de una transaccion',
  })
  @Post('lote')
  createBatch(
    @Body() createRutaEstacionesLoteDto: CreateRutaEstacionesLoteDto,
  ): Promise<BaseResponseDto<RutaEstaciones[]>> {
    return this.rutaEstacionesService.createBatch(createRutaEstacionesLoteDto);
  }

  @ApiOperation({ summary: 'Listar todas las relaciones activas ruta-estacion' })
  @Get()
  findAll(): Promise<BaseResponseDto<RutaEstaciones[]>> {
    return this.rutaEstacionesService.findAll();
  }

  @ApiOperation({ summary: 'Listar estaciones activas de una ruta' })
  @ApiParam({
    name: 'rutaId',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Public()
  @Get('ruta/:rutaId')
  findByRuta(
    @Param('rutaId', new ParseUUIDPipe()) rutaId: string,
  ): Promise<BaseResponseDto<RutaEstaciones[]>> {
    return this.rutaEstacionesService.findByRuta(rutaId);
  }

  @ApiOperation({ summary: 'Obtener una relacion activa ruta-estacion por PK compuesta' })
  @ApiParam({
    name: 'rutaId',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'estacionId',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Get(':rutaId/:estacionId')
  findOne(
    @Param('rutaId', new ParseUUIDPipe()) rutaId: string,
    @Param('estacionId', new ParseUUIDPipe()) estacionId: string,
  ): Promise<BaseResponseDto<RutaEstaciones>> {
    return this.rutaEstacionesService.findOne(rutaId, estacionId);
  }

  @ApiOperation({ summary: 'Restaurar una relacion inactiva ruta-estacion' })
  @ApiParam({
    name: 'rutaId',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'estacionId',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Patch(':rutaId/:estacionId/restore')
  restore(
    @Param('rutaId', new ParseUUIDPipe()) rutaId: string,
    @Param('estacionId', new ParseUUIDPipe()) estacionId: string,
  ): Promise<BaseResponseDto<RutaEstaciones>> {
    return this.rutaEstacionesService.restore(rutaId, estacionId);
  }

  @ApiOperation({
    summary: 'Actualizar una relacion activa ruta-estacion dentro de una transaccion',
  })
  @ApiParam({
    name: 'rutaId',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'estacionId',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Patch(':rutaId/:estacionId')
  update(
    @Param('rutaId', new ParseUUIDPipe()) rutaId: string,
    @Param('estacionId', new ParseUUIDPipe()) estacionId: string,
    @Body() updateRutaEstacioneDto: UpdateRutaEstacioneDto,
  ): Promise<BaseResponseDto<RutaEstaciones>> {
    return this.rutaEstacionesService.update(
      rutaId,
      estacionId,
      updateRutaEstacioneDto,
    );
  }

  @ApiOperation({ summary: 'Desactivar una relacion activa ruta-estacion' })
  @ApiParam({
    name: 'rutaId',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'estacionId',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Delete(':rutaId/:estacionId')
  remove(
    @Param('rutaId', new ParseUUIDPipe()) rutaId: string,
    @Param('estacionId', new ParseUUIDPipe()) estacionId: string,
  ): Promise<BaseResponseDto<RutaEstaciones>> {
    return this.rutaEstacionesService.remove(rutaId, estacionId);
  }
}
