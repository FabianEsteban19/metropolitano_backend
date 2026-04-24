import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { Repository } from 'typeorm';
import { Buses } from 'src/buses/entities/Buses';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { Estaciones } from 'src/estaciones/entities/Estaciones';
import { RutaEstaciones } from 'src/ruta_estaciones/entities/RutaEstaciones';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { Reportes } from './entities/Reportes';

@Injectable()
export class ReportesService {
  constructor(
    //TODO SOLO FALTA IMPLEMENTAR LOS SERVICES ADICIONALES, YA QUE ACTUALMENTE TENEMOS METODOS CREADOS.
    @InjectRepository(Reportes)
    private readonly reportesRepository: Repository<Reportes>,
    //TODO CAMBIARLO POR SU SERVICE CON LOS METODOS CORRESPONDIENTES
    @InjectRepository(Buses)
    private readonly busesRepository: Repository<Buses>,
    @InjectRepository(Estaciones)
    private readonly estacionesRepository: Repository<Estaciones>,
    @InjectRepository(RutaEstaciones)
    private readonly rutaEstacionesRepository: Repository<RutaEstaciones>,
  ) {}

  async create(
    createReporteDto: CreateReporteDto,
  ): Promise<BaseResponseDto<Reportes>> {
    try {
      const bus = await this.findBusActivoOrFail(createReporteDto.busId);

      if (createReporteDto.cantidadPasajeros > bus.capacidad) {
        throw new BadRequestException(
          'La cantidad de pasajeros no puede superar la capacidad del bus',
        );
      }

      if (createReporteDto.estacionId) {
        await this.validateEstacionForBusRoute(bus, createReporteDto.estacionId);
      }

      const nuevoReporte = this.reportesRepository.create(
        this.mapCreateDtoToEntityInput(createReporteDto),
      );
      const reporteGuardado = await this.reportesRepository.save(nuevoReporte);
      const reporteRecargado = await this.findReporteEntityOrFail(
        reporteGuardado.id,
        true,
      );

      return BaseResponseDto.success(
        'Reporte creado correctamente',
        reporteRecargado,
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al crear el reporte');
    }
  }

  async findAll(): Promise<BaseResponseDto<Reportes[]>> {
    try {
      const reportes = await this.reportesRepository.find({
        where: { isActive: true },
        order: { timestamp: 'DESC', id: 'DESC' },
      });

      const message =
        reportes.length > 0
          ? 'Reportes obtenidos correctamente'
          : 'No hay reportes registrados';

      return BaseResponseDto.success(message, reportes);
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al obtener los reportes');
    }
  }

  async findOne(id: string): Promise<BaseResponseDto<Reportes>> {
    try {
      this.validateId(id);

      const reporte = await this.findReporteEntityOrFail(id);

      return BaseResponseDto.success('Reporte encontrado correctamente', reporte);
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al obtener el reporte');
    }
  }

  async update(
    id: string,
    updateReporteDto: UpdateReporteDto,
  ): Promise<BaseResponseDto<Reportes>> {
    try {
      this.validateId(id);

      if (Object.keys(updateReporteDto).length === 0) {
        throw new BadRequestException(
          'Debes enviar al menos un campo para actualizar',
        );
      }

      const reporte = await this.findReporteEntityOrFail(id);
      const busId = updateReporteDto.busId ?? reporte.busId;
      const estacionId =
        updateReporteDto.estacionId !== undefined
          ? updateReporteDto.estacionId
          : reporte.estacionId;
      const cantidadPasajeros =
        updateReporteDto.cantidadPasajeros ?? reporte.cantidadPasajeros;

      const bus = await this.findBusActivoOrFail(busId);

      if (cantidadPasajeros > bus.capacidad) {
        throw new BadRequestException(
          'La cantidad de pasajeros no puede superar la capacidad del bus',
        );
      }

      if (estacionId) {
        await this.validateEstacionForBusRoute(bus, estacionId);
      }

      this.reportesRepository.merge(
        reporte,
        this.mapUpdateDtoToEntityInput(updateReporteDto),
      );
      const reporteActualizado = await this.reportesRepository.save(reporte);
      const reporteRecargado = await this.findReporteEntityOrFail(
        reporteActualizado.id,
        true,
      );

      return BaseResponseDto.confirmation(
        'Reporte actualizado correctamente',
        reporteRecargado,
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al actualizar el reporte');
    }
  }

  async remove(id: string): Promise<BaseResponseDto<Reportes>> {
    try {
      this.validateId(id);

      const reporte = await this.findReporteEntityOrFail(id);
      reporte.isActive = false;

      const reporteDesactivado = await this.reportesRepository.save(reporte);

      return BaseResponseDto.confirmation(
        'Reporte desactivado correctamente',
        reporteDesactivado,
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al desactivar el reporte');
    }
  }

  async restore(id: string): Promise<BaseResponseDto<Reportes>> {
    try {
      this.validateId(id);

      const reporte = await this.findReporteEntityOrFail(id, true);

      if (reporte.isActive) {
        throw new BadRequestException('El reporte ya se encuentra activo');
      }

      const bus = await this.findBusActivoOrFail(reporte.busId);

      if (reporte.cantidadPasajeros > bus.capacidad) {
        throw new BadRequestException(
          'No se puede restaurar el reporte porque supera la capacidad actual del bus',
        );
      }

      if (reporte.estacionId) {
        await this.validateEstacionForBusRoute(bus, reporte.estacionId);
      }

      reporte.isActive = true;

      const reporteRestaurado = await this.reportesRepository.save(reporte);

      return BaseResponseDto.confirmation(
        'Reporte restaurado correctamente',
        reporteRestaurado,
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al restaurar el reporte');
    }
  }

  private async findReporteEntityOrFail(
    id: string,
    includeInactive = false,
  ): Promise<Reportes> {
    const reporte = await this.reportesRepository.findOne({
      where: includeInactive ? { id } : { id, isActive: true },
    });

    if (!reporte) {
      throw new NotFoundException(`No se encontro el reporte con id ${id}`);
    }

    return reporte;
  }

  private async findBusActivoOrFail(busId: string): Promise<Buses> {
    const bus = await this.busesRepository.findOne({
      where: { id: busId, isActive: true },
    });

    if (!bus) {
      throw new NotFoundException(
        `No se encontro un bus activo con id ${busId}`,
      );
    }

    return bus;
  }

  private async findEstacionActivaOrFail(estacionId: string): Promise<Estaciones> {
    const estacion = await this.estacionesRepository.findOne({
      where: { id: estacionId, isActive: true },
    });

    if (!estacion) {
      throw new NotFoundException(
        `No se encontro una estacion activa con id ${estacionId}`,
      );
    }

    return estacion;
  }

  private async validateEstacionForBusRoute(
    bus: Buses,
    estacionId: string,
  ): Promise<void> {
    await this.findEstacionActivaOrFail(estacionId);

    if (!bus.rutaId) {
      throw new ConflictException(
        'El bus no tiene una ruta asignada para reportar una estacion',
      );
    }

    const relacionActiva = await this.rutaEstacionesRepository.findOne({
      where: {
        rutaId: bus.rutaId,
        estacionId,
        isActive: true,
      },
    });

    if (!relacionActiva) {
      throw new ConflictException(
        'La estacion indicada no pertenece a la ruta activa del bus',
      );
    }
  }

  private validateId(id: string): void {
    if (!id?.trim() || !isUUID(id)) {
      throw new BadRequestException('El id debe ser un UUID valido');
    }
  }

  private mapCreateDtoToEntityInput(dto: CreateReporteDto): Partial<Reportes> {
    return {
      busId: dto.busId,
      estacionId: dto.estacionId ?? null,
      latitud: dto.latitud.toString(),
      longitud: dto.longitud.toString(),
      cantidadPasajeros: dto.cantidadPasajeros,
      timestamp: dto.timestamp ?? new Date(),
      ocupacionPct:
        dto.ocupacionPct !== undefined ? dto.ocupacionPct.toString() : null,
      velocidadKmh:
        dto.velocidadKmh !== undefined ? dto.velocidadKmh.toString() : null,
      isActive: true,
    };
  }

  private mapUpdateDtoToEntityInput(dto: UpdateReporteDto): Partial<Reportes> {
    const updateData: Partial<Reportes> = {};

    if (dto.busId !== undefined) {
      updateData.busId = dto.busId;
    }

    if (dto.estacionId !== undefined) {
      updateData.estacionId = dto.estacionId ?? null;
    }

    if (dto.latitud !== undefined) {
      updateData.latitud = dto.latitud.toString();
    }

    if (dto.longitud !== undefined) {
      updateData.longitud = dto.longitud.toString();
    }

    if (dto.cantidadPasajeros !== undefined) {
      updateData.cantidadPasajeros = dto.cantidadPasajeros;
    }

    if (dto.timestamp !== undefined) {
      updateData.timestamp = dto.timestamp;
    }

    if (dto.ocupacionPct !== undefined) {
      updateData.ocupacionPct = dto.ocupacionPct.toString();
    }

    if (dto.velocidadKmh !== undefined) {
      updateData.velocidadKmh = dto.velocidadKmh.toString();
    }

    return updateData;
  }

  private handleUnexpectedError(error: unknown, message: string): never {
    if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException(message);
  }
}
