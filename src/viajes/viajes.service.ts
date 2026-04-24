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
import { Rutas } from 'src/rutas/entities/Rutas';
import { CreateViajeDto } from './dto/create-viaje.dto';
import { UpdateViajeDto } from './dto/update-viaje.dto';
import { Viajes } from './entities/Viajes';

@Injectable()
export class ViajesService {
  constructor(
    @InjectRepository(Viajes)
    private readonly viajesRepository: Repository<Viajes>,
    @InjectRepository(Rutas)
    private readonly rutasRepository: Repository<Rutas>,
    @InjectRepository(Buses)
    private readonly busesRepository: Repository<Buses>,
  ) {}

  async create(createViajeDto: CreateViajeDto): Promise<BaseResponseDto<Viajes>> {
    try {
      await this.findRutaActivaOrFail(createViajeDto.rutaId);
      const bus = await this.findBusActivoOrFail(createViajeDto.busId);

      this.validateBusRuta(bus, createViajeDto.rutaId);
      this.validateViajeTimes({
        horaSalidaProgramada: createViajeDto.horaSalidaProgramada,
        horaSalidaReal: createViajeDto.horaSalidaReal ?? null,
        horaLlegadaProgramada: createViajeDto.horaLlegadaProgramada ?? null,
        horaLlegadaReal: createViajeDto.horaLlegadaReal ?? null,
      });

      await this.ensureBusScheduleAvailable(
        createViajeDto.busId,
        createViajeDto.fechaOperacion,
        createViajeDto.horaSalidaProgramada,
      );

      const nuevoViaje = this.viajesRepository.create(
        this.mapCreateDtoToEntityInput(createViajeDto),
      );
      const viajeGuardado = await this.viajesRepository.save(nuevoViaje);

      return BaseResponseDto.success('Viaje creado correctamente', viajeGuardado);
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al crear el viaje');
    }
  }

  async findAll(): Promise<BaseResponseDto<Viajes[]>> {
    try {
      const viajes = await this.viajesRepository.find({
        where: { isActive: true },
        order: {
          fechaOperacion: 'DESC',
          horaSalidaProgramada: 'ASC',
          createdAt: 'DESC',
        },
      });

      const message =
        viajes.length > 0
          ? 'Viajes obtenidos correctamente'
          : 'No hay viajes registrados';

      return BaseResponseDto.success(message, viajes);
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al obtener los viajes');
    }
  }

  async findOne(id: string): Promise<BaseResponseDto<Viajes>> {
    try {
      this.validateId(id);

      const viaje = await this.findViajeEntityOrFail(id);

      return BaseResponseDto.success('Viaje encontrado correctamente', viaje);
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al obtener el viaje');
    }
  }

  async update(
    id: string,
    updateViajeDto: UpdateViajeDto,
  ): Promise<BaseResponseDto<Viajes>> {
    try {
      this.validateId(id);

      if (Object.keys(updateViajeDto).length === 0) {
        throw new BadRequestException(
          'Debes enviar al menos un campo para actualizar',
        );
      }

      const viaje = await this.findViajeEntityOrFail(id);
      const rutaId = updateViajeDto.rutaId ?? viaje.rutaId;
      const busId = updateViajeDto.busId ?? viaje.busId;
      const fechaOperacion =
        updateViajeDto.fechaOperacion ?? viaje.fechaOperacion;
      const horaSalidaProgramada =
        updateViajeDto.horaSalidaProgramada ?? viaje.horaSalidaProgramada;
      const horaSalidaReal = this.resolveNullableDate(
        updateViajeDto,
        'horaSalidaReal',
        viaje.horaSalidaReal,
      );
      const horaLlegadaProgramada = this.resolveNullableDate(
        updateViajeDto,
        'horaLlegadaProgramada',
        viaje.horaLlegadaProgramada,
      );
      const horaLlegadaReal = this.resolveNullableDate(
        updateViajeDto,
        'horaLlegadaReal',
        viaje.horaLlegadaReal,
      );

      await this.findRutaActivaOrFail(rutaId);
      const bus = await this.findBusActivoOrFail(busId);

      this.validateBusRuta(bus, rutaId);
      this.validateViajeTimes({
        horaSalidaProgramada,
        horaSalidaReal,
        horaLlegadaProgramada,
        horaLlegadaReal,
      });

      if (
        updateViajeDto.busId !== undefined ||
        updateViajeDto.fechaOperacion !== undefined ||
        updateViajeDto.horaSalidaProgramada !== undefined
      ) {
        await this.ensureBusScheduleAvailable(
          busId,
          fechaOperacion,
          horaSalidaProgramada,
          viaje.id,
        );
      }

      this.viajesRepository.merge(
        viaje,
        this.mapUpdateDtoToEntityInput(updateViajeDto),
      );
      const viajeActualizado = await this.viajesRepository.save(viaje);

      return BaseResponseDto.confirmation(
        'Viaje actualizado correctamente',
        viajeActualizado,
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al actualizar el viaje');
    }
  }

  async remove(id: string): Promise<BaseResponseDto<Viajes>> {
    try {
      this.validateId(id);

      const viaje = await this.findViajeEntityOrFail(id);
      viaje.isActive = false;

      const viajeDesactivado = await this.viajesRepository.save(viaje);

      return BaseResponseDto.confirmation(
        'Viaje desactivado correctamente',
        viajeDesactivado,
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al desactivar el viaje');
    }
  }

  async restore(id: string): Promise<BaseResponseDto<Viajes>> {
    try {
      this.validateId(id);

      const viaje = await this.findViajeEntityOrFail(id, true);

      if (viaje.isActive) {
        throw new BadRequestException('El viaje ya se encuentra activo');
      }

      await this.findRutaActivaOrFail(viaje.rutaId);
      const bus = await this.findBusActivoOrFail(viaje.busId);

      this.validateBusRuta(bus, viaje.rutaId);
      await this.ensureBusScheduleAvailable(
        viaje.busId,
        viaje.fechaOperacion,
        viaje.horaSalidaProgramada,
        viaje.id,
      );

      viaje.isActive = true;

      const viajeRestaurado = await this.viajesRepository.save(viaje);

      return BaseResponseDto.confirmation(
        'Viaje restaurado correctamente',
        viajeRestaurado,
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al restaurar el viaje');
    }
  }

  private async findViajeEntityOrFail(
    id: string,
    includeInactive = false,
  ): Promise<Viajes> {
    const viaje = await this.viajesRepository.findOne({
      where: includeInactive ? { id } : { id, isActive: true },
    });

    if (!viaje) {
      throw new NotFoundException(`No se encontro el viaje con id ${id}`);
    }

    return viaje;
  }

  private async findRutaActivaOrFail(rutaId: string): Promise<Rutas> {
    const ruta = await this.rutasRepository.findOne({
      where: { id: rutaId, isActive: true },
    });

    if (!ruta) {
      throw new NotFoundException(
        `No se encontro una ruta activa con id ${rutaId}`,
      );
    }

    return ruta;
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

  private async ensureBusScheduleAvailable(
    busId: string,
    fechaOperacion: string,
    horaSalidaProgramada: Date,
    currentViajeId?: string,
  ): Promise<void> {
    const query = this.viajesRepository
      .createQueryBuilder('viaje')
      .where('viaje.bus_id = :busId', { busId })
      .andWhere('viaje.fecha_operacion = :fechaOperacion', { fechaOperacion })
      .andWhere('viaje.hora_salida_programada = :horaSalidaProgramada', {
        horaSalidaProgramada,
      })
      .andWhere('viaje.is_active = true');

    if (currentViajeId) {
      query.andWhere('viaje.id <> :currentViajeId', { currentViajeId });
    }

    const viajeExistente = await query.getOne();

    if (viajeExistente) {
      throw new ConflictException(
        'Ya existe un viaje activo para ese bus con la misma fecha y hora de salida programada',
      );
    }
  }

  private validateBusRuta(bus: Buses, rutaId: string): void {
    if (bus.rutaId && bus.rutaId !== rutaId) {
      throw new ConflictException(
        'El bus seleccionado no pertenece a la ruta indicada',
      );
    }
  }

  private validateViajeTimes(times: {
    horaSalidaProgramada: Date;
    horaSalidaReal: Date | null;
    horaLlegadaProgramada: Date | null;
    horaLlegadaReal: Date | null;
  }): void {
    const {
      horaSalidaProgramada,
      horaSalidaReal,
      horaLlegadaProgramada,
      horaLlegadaReal,
    } = times;

    if (
      horaLlegadaProgramada &&
      horaLlegadaProgramada < horaSalidaProgramada
    ) {
      throw new BadRequestException(
        'La hora de llegada programada no puede ser menor que la hora de salida programada',
      );
    }

    if (horaSalidaReal && horaLlegadaReal && horaLlegadaReal < horaSalidaReal) {
      throw new BadRequestException(
        'La hora de llegada real no puede ser menor que la hora de salida real',
      );
    }
  }

  private validateId(id: string): void {
    if (!id?.trim() || !isUUID(id)) {
      throw new BadRequestException('El id debe ser un UUID valido');
    }
  }

  private mapCreateDtoToEntityInput(dto: CreateViajeDto): Partial<Viajes> {
    return {
      rutaId: dto.rutaId,
      busId: dto.busId,
      fechaOperacion: dto.fechaOperacion,
      horaSalidaProgramada: dto.horaSalidaProgramada,
      horaSalidaReal: dto.horaSalidaReal ?? null,
      horaLlegadaProgramada: dto.horaLlegadaProgramada ?? null,
      horaLlegadaReal: dto.horaLlegadaReal ?? null,
      estado: dto.estado ?? 'programado',
      sentido: dto.sentido ?? 'ida',
      observaciones: dto.observaciones?.trim() || null,
      isActive: true,
    };
  }

  private mapUpdateDtoToEntityInput(dto: UpdateViajeDto): Partial<Viajes> {
    const updateData: Partial<Viajes> = {};

    if (dto.rutaId !== undefined) {
      updateData.rutaId = dto.rutaId;
    }

    if (dto.busId !== undefined) {
      updateData.busId = dto.busId;
    }

    if (dto.fechaOperacion !== undefined) {
      updateData.fechaOperacion = dto.fechaOperacion;
    }

    if (dto.horaSalidaProgramada !== undefined) {
      updateData.horaSalidaProgramada = dto.horaSalidaProgramada;
    }

    if (dto.horaSalidaReal !== undefined) {
      updateData.horaSalidaReal = dto.horaSalidaReal ?? null;
    }

    if (dto.horaLlegadaProgramada !== undefined) {
      updateData.horaLlegadaProgramada = dto.horaLlegadaProgramada ?? null;
    }

    if (dto.horaLlegadaReal !== undefined) {
      updateData.horaLlegadaReal = dto.horaLlegadaReal ?? null;
    }

    if (dto.estado !== undefined) {
      updateData.estado = dto.estado;
    }

    if (dto.sentido !== undefined) {
      updateData.sentido = dto.sentido;
    }

    if (dto.observaciones !== undefined) {
      updateData.observaciones = dto.observaciones?.trim() || null;
    }

    return updateData;
  }

  private resolveNullableDate<T extends keyof UpdateViajeDto>(
    dto: UpdateViajeDto,
    field: T,
    currentValue: Date | null,
  ): Date | null {
    return dto[field] !== undefined ? (dto[field] as Date | null) : currentValue;
  }

  private handleUnexpectedError(error: unknown, message: string): never {
    if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException(message);
  }
}
