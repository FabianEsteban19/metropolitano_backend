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
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { Estaciones } from 'src/estaciones/entities/Estaciones';
import { Viajes } from 'src/viajes/entities/Viajes';
import { CreateViajeEstacionDto } from './dto/create-viaje-estacion.dto';
import { UpdateViajeEstacionDto } from './dto/update-viaje-estacion.dto';
import { ViajeEstaciones } from './entities/ViajeEstaciones';

@Injectable()
export class ViajeEstacionesService {
  constructor(
    @InjectRepository(ViajeEstaciones)
    private readonly viajeEstacionesRepository: Repository<ViajeEstaciones>,
    @InjectRepository(Viajes)
    private readonly viajesRepository: Repository<Viajes>,
    @InjectRepository(Estaciones)
    private readonly estacionesRepository: Repository<Estaciones>,
  ) {}

  async create(
    createViajeEstacionDto: CreateViajeEstacionDto,
  ): Promise<BaseResponseDto<ViajeEstaciones>> {
    try {
      await this.findViajeActivoOrFail(createViajeEstacionDto.viajeId);
      await this.findEstacionActivaOrFail(createViajeEstacionDto.estacionId);

      this.validateViajeEstacionTimes({
        horaLlegadaProgramada:
          createViajeEstacionDto.horaLlegadaProgramada ?? null,
        horaLlegadaReal: createViajeEstacionDto.horaLlegadaReal ?? null,
        horaSalidaProgramada:
          createViajeEstacionDto.horaSalidaProgramada ?? null,
        horaSalidaReal: createViajeEstacionDto.horaSalidaReal ?? null,
      });

      await this.ensureOrdenAvailable(
        createViajeEstacionDto.viajeId,
        createViajeEstacionDto.orden,
      );

      const nuevaViajeEstacion = this.viajeEstacionesRepository.create(
        this.mapCreateDtoToEntityInput(createViajeEstacionDto),
      );
      const viajeEstacionGuardada =
        await this.viajeEstacionesRepository.save(nuevaViajeEstacion);

      return BaseResponseDto.success(
        'Parada operativa creada correctamente',
        viajeEstacionGuardada,
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al crear la parada operativa');
    }
  }

  async findAll(): Promise<BaseResponseDto<ViajeEstaciones[]>> {
    try {
      const viajeEstaciones = await this.viajeEstacionesRepository.find({
        where: { isActive: true },
        order: {
          viajeId: 'ASC',
          orden: 'ASC',
          createdAt: 'ASC',
        },
      });

      const message =
        viajeEstaciones.length > 0
          ? 'Paradas operativas obtenidas correctamente'
          : 'No hay paradas operativas registradas';

      return BaseResponseDto.success(message, viajeEstaciones);
    } catch (error) {
      this.handleUnexpectedError(
        error,
        'Error al obtener las paradas operativas',
      );
    }
  }

  async findOne(id: string): Promise<BaseResponseDto<ViajeEstaciones>> {
    try {
      this.validateId(id);

      const viajeEstacion = await this.findViajeEstacionEntityOrFail(id);

      return BaseResponseDto.success(
        'Parada operativa encontrada correctamente',
        viajeEstacion,
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al obtener la parada operativa');
    }
  }

  async update(
    id: string,
    updateViajeEstacionDto: UpdateViajeEstacionDto,
  ): Promise<BaseResponseDto<ViajeEstaciones>> {
    try {
      this.validateId(id);

      if (Object.keys(updateViajeEstacionDto).length === 0) {
        throw new BadRequestException(
          'Debes enviar al menos un campo para actualizar',
        );
      }

      const viajeEstacion = await this.findViajeEstacionEntityOrFail(id);
      const viajeId = updateViajeEstacionDto.viajeId ?? viajeEstacion.viajeId;
      const estacionId =
        updateViajeEstacionDto.estacionId ?? viajeEstacion.estacionId;
      const orden = updateViajeEstacionDto.orden ?? viajeEstacion.orden;
      const horaLlegadaProgramada = this.resolveNullableDate(
        updateViajeEstacionDto,
        'horaLlegadaProgramada',
        viajeEstacion.horaLlegadaProgramada,
      );
      const horaLlegadaReal = this.resolveNullableDate(
        updateViajeEstacionDto,
        'horaLlegadaReal',
        viajeEstacion.horaLlegadaReal,
      );
      const horaSalidaProgramada = this.resolveNullableDate(
        updateViajeEstacionDto,
        'horaSalidaProgramada',
        viajeEstacion.horaSalidaProgramada,
      );
      const horaSalidaReal = this.resolveNullableDate(
        updateViajeEstacionDto,
        'horaSalidaReal',
        viajeEstacion.horaSalidaReal,
      );

      await this.findViajeActivoOrFail(viajeId);
      await this.findEstacionActivaOrFail(estacionId);

      this.validateViajeEstacionTimes({
        horaLlegadaProgramada,
        horaLlegadaReal,
        horaSalidaProgramada,
        horaSalidaReal,
      });

      if (
        updateViajeEstacionDto.viajeId !== undefined ||
        updateViajeEstacionDto.orden !== undefined
      ) {
        await this.ensureOrdenAvailable(viajeId, orden, viajeEstacion.id);
      }

      this.viajeEstacionesRepository.merge(
        viajeEstacion,
        this.mapUpdateDtoToEntityInput(updateViajeEstacionDto),
      );
      const viajeEstacionActualizada =
        await this.viajeEstacionesRepository.save(viajeEstacion);

      return BaseResponseDto.confirmation(
        'Parada operativa actualizada correctamente',
        viajeEstacionActualizada,
      );
    } catch (error) {
      this.handleUnexpectedError(
        error,
        'Error al actualizar la parada operativa',
      );
    }
  }

  async remove(id: string): Promise<BaseResponseDto<ViajeEstaciones>> {
    try {
      this.validateId(id);

      const viajeEstacion = await this.findViajeEstacionEntityOrFail(id);
      viajeEstacion.isActive = false;

      const viajeEstacionDesactivada =
        await this.viajeEstacionesRepository.save(viajeEstacion);

      return BaseResponseDto.confirmation(
        'Parada operativa desactivada correctamente',
        viajeEstacionDesactivada,
      );
    } catch (error) {
      this.handleUnexpectedError(
        error,
        'Error al desactivar la parada operativa',
      );
    }
  }

  async restore(id: string): Promise<BaseResponseDto<ViajeEstaciones>> {
    try {
      this.validateId(id);

      const viajeEstacion = await this.findViajeEstacionEntityOrFail(id, true);

      if (viajeEstacion.isActive) {
        throw new BadRequestException(
          'La parada operativa ya se encuentra activa',
        );
      }

      await this.findViajeActivoOrFail(viajeEstacion.viajeId);
      await this.findEstacionActivaOrFail(viajeEstacion.estacionId);
      await this.ensureOrdenAvailable(
        viajeEstacion.viajeId,
        viajeEstacion.orden,
        viajeEstacion.id,
      );

      viajeEstacion.isActive = true;

      const viajeEstacionRestaurada =
        await this.viajeEstacionesRepository.save(viajeEstacion);

      return BaseResponseDto.confirmation(
        'Parada operativa restaurada correctamente',
        viajeEstacionRestaurada,
      );
    } catch (error) {
      this.handleUnexpectedError(
        error,
        'Error al restaurar la parada operativa',
      );
    }
  }

  private async findViajeEstacionEntityOrFail(
    id: string,
    includeInactive = false,
  ): Promise<ViajeEstaciones> {
    const viajeEstacion = await this.viajeEstacionesRepository.findOne({
      where: includeInactive ? { id } : { id, isActive: true },
    });

    if (!viajeEstacion) {
      throw new NotFoundException(
        `No se encontro la parada operativa con id ${id}`,
      );
    }

    return viajeEstacion;
  }

  private async findViajeActivoOrFail(viajeId: string): Promise<Viajes> {
    const viaje = await this.viajesRepository.findOne({
      where: { id: viajeId, isActive: true },
    });

    if (!viaje) {
      throw new NotFoundException(
        `No se encontro un viaje activo con id ${viajeId}`,
      );
    }

    return viaje;
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

  private async ensureOrdenAvailable(
    viajeId: string,
    orden: number,
    currentViajeEstacionId?: string,
  ): Promise<void> {
    const query = this.viajeEstacionesRepository
      .createQueryBuilder('viajeEstacion')
      .where('viajeEstacion.viaje_id = :viajeId', { viajeId })
      .andWhere('viajeEstacion.orden = :orden', { orden });

    if (currentViajeEstacionId) {
      query.andWhere('viajeEstacion.id <> :currentViajeEstacionId', {
        currentViajeEstacionId,
      });
    }

    const viajeEstacionExistente = await query.getOne();

    if (viajeEstacionExistente) {
      throw new ConflictException(
        'Ya existe una parada operativa con ese orden para el viaje indicado',
      );
    }
  }

  private validateViajeEstacionTimes(times: {
    horaLlegadaProgramada: Date | null;
    horaLlegadaReal: Date | null;
    horaSalidaProgramada: Date | null;
    horaSalidaReal: Date | null;
  }): void {
    const {
      horaLlegadaProgramada,
      horaLlegadaReal,
      horaSalidaProgramada,
      horaSalidaReal,
    } = times;

    if (
      horaLlegadaProgramada &&
      horaSalidaProgramada &&
      horaSalidaProgramada < horaLlegadaProgramada
    ) {
      throw new BadRequestException(
        'La hora de salida programada no puede ser menor que la hora de llegada programada',
      );
    }

    if (horaLlegadaReal && horaSalidaReal && horaSalidaReal < horaLlegadaReal) {
      throw new BadRequestException(
        'La hora de salida real no puede ser menor que la hora de llegada real',
      );
    }
  }

  private validateId(id: string): void {
    if (!id?.trim() || !isUUID(id)) {
      throw new BadRequestException('El id debe ser un UUID valido');
    }
  }

  private mapCreateDtoToEntityInput(
    dto: CreateViajeEstacionDto,
  ): Partial<ViajeEstaciones> {
    return {
      viajeId: dto.viajeId,
      estacionId: dto.estacionId,
      orden: dto.orden,
      horaLlegadaProgramada: dto.horaLlegadaProgramada ?? null,
      horaLlegadaReal: dto.horaLlegadaReal ?? null,
      horaSalidaProgramada: dto.horaSalidaProgramada ?? null,
      horaSalidaReal: dto.horaSalidaReal ?? null,
      estadoCumplimiento: dto.estadoCumplimiento ?? 'pendiente',
      observaciones: dto.observaciones?.trim() || null,
      isActive: true,
    };
  }

  private mapUpdateDtoToEntityInput(
    dto: UpdateViajeEstacionDto,
  ): Partial<ViajeEstaciones> {
    const updateData: Partial<ViajeEstaciones> = {};

    if (dto.viajeId !== undefined) {
      updateData.viajeId = dto.viajeId;
    }

    if (dto.estacionId !== undefined) {
      updateData.estacionId = dto.estacionId;
    }

    if (dto.orden !== undefined) {
      updateData.orden = dto.orden;
    }

    if (dto.horaLlegadaProgramada !== undefined) {
      updateData.horaLlegadaProgramada = dto.horaLlegadaProgramada ?? null;
    }

    if (dto.horaLlegadaReal !== undefined) {
      updateData.horaLlegadaReal = dto.horaLlegadaReal ?? null;
    }

    if (dto.horaSalidaProgramada !== undefined) {
      updateData.horaSalidaProgramada = dto.horaSalidaProgramada ?? null;
    }

    if (dto.horaSalidaReal !== undefined) {
      updateData.horaSalidaReal = dto.horaSalidaReal ?? null;
    }

    if (dto.estadoCumplimiento !== undefined) {
      updateData.estadoCumplimiento = dto.estadoCumplimiento;
    }

    if (dto.observaciones !== undefined) {
      updateData.observaciones = dto.observaciones?.trim() || null;
    }

    return updateData;
  }

  private resolveNullableDate<T extends keyof UpdateViajeEstacionDto>(
    dto: UpdateViajeEstacionDto,
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
