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
import { CreateViajeDto } from './dto/create-viaje.dto';
import { UpdateViajeDto } from './dto/update-viaje.dto';
import { Viajes } from './entities/Viajes';
import { ViajesService } from './viajes.service';

@ApiTags('viajes')
@Controller('viajes')
export class ViajesController {
  constructor(private readonly viajesService: ViajesService) {}

  @ApiOperation({ summary: 'Crear un nuevo viaje operativo' })
  @Post()
  create(@Body() createViajeDto: CreateViajeDto): Promise<BaseResponseDto<Viajes>> {
    return this.viajesService.create(createViajeDto);
  }

  @ApiOperation({ summary: 'Listar todos los viajes activos' })
  @Get()
  findAll(): Promise<BaseResponseDto<Viajes[]>> {
    return this.viajesService.findAll();
  }

  @ApiOperation({ summary: 'Obtener un viaje activo por id' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BaseResponseDto<Viajes>> {
    return this.viajesService.findOne(id);
  }

  @ApiOperation({ summary: 'Restaurar un viaje inactivo' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  @Patch(':id/restore')
  restore(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BaseResponseDto<Viajes>> {
    return this.viajesService.restore(id);
  }

  @ApiOperation({ summary: 'Actualizar un viaje activo por id' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateViajeDto: UpdateViajeDto,
  ): Promise<BaseResponseDto<Viajes>> {
    return this.viajesService.update(id, updateViajeDto);
  }

  @ApiOperation({ summary: 'Desactivar un viaje por id' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BaseResponseDto<Viajes>> {
    return this.viajesService.remove(id);
  }
}
