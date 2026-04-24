import {
  Controller,
  Body,
  Delete,
  Get,
  Patch,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/public.decorator';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { ReportesService } from './reportes.service';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { Reportes } from './entities/Reportes';

@ApiTags('reportes')
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @ApiOperation({ summary: 'Crear un nuevo reporte operativo' })
  @Post()
  create(
    @Body() createReporteDto: CreateReporteDto,
  ): Promise<BaseResponseDto<Reportes>> {
    return this.reportesService.create(createReporteDto);
  }

  @ApiOperation({ summary: 'Listar todos los reportes activos' })
  @Public()
  @Get()
  findAll(): Promise<BaseResponseDto<Reportes[]>> {
    return this.reportesService.findAll();
  }

  @ApiOperation({ summary: 'Obtener un reporte activo por id' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BaseResponseDto<Reportes>> {
    return this.reportesService.findOne(id);
  }

  @ApiOperation({ summary: 'Restaurar un reporte inactivo' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  @Patch(':id/restore')
  restore(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BaseResponseDto<Reportes>> {
    return this.reportesService.restore(id);
  }

  @ApiOperation({ summary: 'Actualizar un reporte activo por id' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateReporteDto: UpdateReporteDto,
  ): Promise<BaseResponseDto<Reportes>> {
    return this.reportesService.update(id, updateReporteDto);
  }

  @ApiOperation({ summary: 'Desactivar un reporte por id' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BaseResponseDto<Reportes>> {
    return this.reportesService.remove(id);
  }
}
