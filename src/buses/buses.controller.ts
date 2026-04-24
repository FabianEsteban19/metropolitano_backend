import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { BusesService } from './buses.service';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { Buses } from './entities/Buses';

@ApiTags('buses')
@Controller('buses')
export class BusesController {
  constructor(private readonly busesService: BusesService) {}

  @ApiOperation({ summary: 'Crear un nuevo bus' })
  @Post()
  create(@Body() createBusDto: CreateBusDto): Promise<BaseResponseDto<Buses>> {
    return this.busesService.create(createBusDto);
  }

  @ApiOperation({ summary: 'Listar todos los buses activos' })
  @Get()
  findAll(): Promise<BaseResponseDto<Buses[]>> {
    return this.busesService.findAll();
  }

  @ApiOperation({ summary: 'Buscar un bus activo por id' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BaseResponseDto<Buses>> {
    return this.busesService.findOne(id);
  }

  @ApiOperation({ summary: 'Restaurar un bus inactivo' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @Patch(':id/restore')
  restore(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BaseResponseDto<Buses>> {
    return this.busesService.restore(id);
  }

  @ApiOperation({ summary: 'Actualizar un bus activo por id' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateBusDto: UpdateBusDto,
  ): Promise<BaseResponseDto<Buses>> {
    return this.busesService.update(id, updateBusDto);
  }

  @ApiOperation({ summary: 'Desactivar un bus por id' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BaseResponseDto<Buses>> {
    return this.busesService.remove(id);
  }
}
