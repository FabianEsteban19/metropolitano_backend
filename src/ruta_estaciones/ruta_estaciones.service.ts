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
import { DataSource, Repository } from 'typeorm';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { Estaciones } from 'src/estaciones/entities/Estaciones';
import { Rutas } from 'src/rutas/entities/Rutas';
import { CreateRutaEstacioneDto } from './dto/create-ruta_estacione.dto';
import {
  CreateRutaEstacionesLoteDto,
  RutaEstacionLoteItemDto,
} from './dto/create-ruta-estaciones-lote.dto';
import { UpdateRutaEstacioneDto } from './dto/update-ruta_estacione.dto';
import { RutaEstaciones } from './entities/RutaEstaciones';

@Injectable()
export class RutaEstacionesService {
  constructor(
    @InjectRepository(RutaEstaciones)
    private readonly rutaEstacionesRepository: Repository<RutaEstaciones>,
    @InjectRepository(Rutas)
    private readonly rutasRepository: Repository<Rutas>,
    @InjectRepository(Estaciones)
    private readonly estacionesRepository: Repository<Estaciones>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createRutaEstacioneDto: CreateRutaEstacioneDto,
  ): Promise<BaseResponseDto<RutaEstaciones>> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [rutaEstacionGuardada] = await this.saveRutaEstacionesBatch(
        createRutaEstacioneDto.rutaId,
        [
          {
            estacionId: createRutaEstacioneDto.estacionId,
            orden: createRutaEstacioneDto.orden,
          },
        ],
        queryRunner.manager.getRepository(RutaEstaciones),
        queryRunner.manager.getRepository(Rutas),
        queryRunner.manager.getRepository(Estaciones),
      );

      await queryRunner.commitTransaction();

      return BaseResponseDto.success(
        'Relacion ruta-estacion creada correctamente',
        rutaEstacionGuardada,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleUnexpectedError(error, 'Error al crear la relacion ruta-estacion');
    } finally {
      await queryRunner.release();
    }
  }

  async createBatch(
    createRutaEstacionesLoteDto: CreateRutaEstacionesLoteDto,
  ): Promise<BaseResponseDto<RutaEstaciones[]>> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const relacionesGuardadas = await this.saveRutaEstacionesBatch(
        createRutaEstacionesLoteDto.rutaId,
        createRutaEstacionesLoteDto.estaciones,
        queryRunner.manager.getRepository(RutaEstaciones),
        queryRunner.manager.getRepository(Rutas),
        queryRunner.manager.getRepository(Estaciones),
      );

      await queryRunner.commitTransaction();

      return BaseResponseDto.success(
        'Estaciones de la ruta registradas correctamente',
        relacionesGuardadas,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleUnexpectedError(
        error,
        'Error al registrar las estaciones de la ruta',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<BaseResponseDto<RutaEstaciones[]>> {
    try {
      const relaciones = await this.rutaEstacionesRepository.find({
        where: { isActive: true },
        order: { rutaId: 'ASC', orden: 'ASC', estacionId: 'ASC' },
      });

      const message =
        relaciones.length > 0
          ? 'Relaciones ruta-estacion obtenidas correctamente'
          : 'No hay relaciones ruta-estacion registradas';

      return BaseResponseDto.success(message, relaciones);
    } catch (error) {
      this.handleUnexpectedError(
        error,
        'Error al obtener las relaciones ruta-estacion',
      );
    }
  }

  async findByRuta(rutaId: string): Promise<BaseResponseDto<RutaEstaciones[]>> {
    try {
      this.validateId(rutaId, 'rutaId');

      const relaciones = await this.rutaEstacionesRepository.find({
        where: { rutaId, isActive: true },
        order: { orden: 'ASC', estacionId: 'ASC' },
      });

      return BaseResponseDto.success(
        'Estaciones de la ruta obtenidas correctamente',
        relaciones,
      );
    } catch (error) {
      this.handleUnexpectedError(
        error,
        'Error al obtener las estaciones de la ruta',
      );
    }
  }

  async findOne(
    rutaId: string,
    estacionId: string,
  ): Promise<BaseResponseDto<RutaEstaciones>> {
    try {
      this.validateCompositeIds(rutaId, estacionId);

      const relacion = await this.findRutaEstacionEntityOrFail(rutaId, estacionId);

      return BaseResponseDto.success(
        'Relacion ruta-estacion encontrada correctamente',
        relacion,
      );
    } catch (error) {
      this.handleUnexpectedError(
        error,
        'Error al obtener la relacion ruta-estacion',
      );
    }
  }

  async update(
    rutaId: string,
    estacionId: string,
    updateRutaEstacioneDto: UpdateRutaEstacioneDto,
  ): Promise<BaseResponseDto<RutaEstaciones>> {
    this.validateCompositeIds(rutaId, estacionId);

    if (Object.keys(updateRutaEstacioneDto).length === 0) {
      throw new BadRequestException(
        'Debes enviar al menos un campo para actualizar',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const rutaEstacionesRepository =
        queryRunner.manager.getRepository(RutaEstaciones);
      const rutasRepository = queryRunner.manager.getRepository(Rutas);
      const estacionesRepository = queryRunner.manager.getRepository(Estaciones);

      const relacionActual = await this.findRutaEstacionEntityOrFail(
        rutaId,
        estacionId,
      );

      const nuevoRutaId = updateRutaEstacioneDto.rutaId ?? relacionActual.rutaId;
      const nuevoEstacionId =
        updateRutaEstacioneDto.estacionId ?? relacionActual.estacionId;
      const nuevoOrden = updateRutaEstacioneDto.orden ?? relacionActual.orden;

      await this.findRutaActivaOrFail(nuevoRutaId, rutasRepository);
      await this.findEstacionActivaOrFail(nuevoEstacionId, estacionesRepository);

      await this.ensureCompositeKeyAvailable(
        nuevoRutaId,
        nuevoEstacionId,
        rutaEstacionesRepository,
        rutaId,
        estacionId,
      );
      await this.ensureOrdenAvailable(
        nuevoRutaId,
        nuevoOrden,
        rutaEstacionesRepository,
        rutaId,
        estacionId,
      );

      relacionActual.isActive = false;
      await rutaEstacionesRepository.save(relacionActual);

      const nuevaRelacion = rutaEstacionesRepository.create({
        rutaId: nuevoRutaId,
        estacionId: nuevoEstacionId,
        orden: nuevoOrden,
        isActive: true,
      });

      const relacionActualizada =
        await rutaEstacionesRepository.save(nuevaRelacion);

      await queryRunner.commitTransaction();

      return BaseResponseDto.confirmation(
        'Relacion ruta-estacion actualizada correctamente',
        relacionActualizada,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleUnexpectedError(
        error,
        'Error al actualizar la relacion ruta-estacion',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async remove(
    rutaId: string,
    estacionId: string,
  ): Promise<BaseResponseDto<RutaEstaciones>> {
    this.validateCompositeIds(rutaId, estacionId);

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const rutaEstacionesRepository =
        queryRunner.manager.getRepository(RutaEstaciones);
      const relacion = await this.findRutaEstacionEntityOrFail(rutaId, estacionId);

      relacion.isActive = false;

      const relacionDesactivada =
        await rutaEstacionesRepository.save(relacion);

      await queryRunner.commitTransaction();

      return BaseResponseDto.confirmation(
        'Relacion ruta-estacion desactivada correctamente',
        relacionDesactivada,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleUnexpectedError(
        error,
        'Error al desactivar la relacion ruta-estacion',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async restore(
    rutaId: string,
    estacionId: string,
  ): Promise<BaseResponseDto<RutaEstaciones>> {
    this.validateCompositeIds(rutaId, estacionId);

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const rutaEstacionesRepository =
        queryRunner.manager.getRepository(RutaEstaciones);
      const rutasRepository = queryRunner.manager.getRepository(Rutas);
      const estacionesRepository = queryRunner.manager.getRepository(Estaciones);

      const relacion = await this.findRutaEstacionEntityOrFail(
        rutaId,
        estacionId,
        true,
      );

      if (relacion.isActive) {
        throw new BadRequestException(
          'La relacion ruta-estacion ya se encuentra activa',
        );
      }

      await this.findRutaActivaOrFail(relacion.rutaId, rutasRepository);
      await this.findEstacionActivaOrFail(relacion.estacionId, estacionesRepository);
      await this.ensureOrdenAvailable(
        relacion.rutaId,
        relacion.orden,
        rutaEstacionesRepository,
        relacion.rutaId,
        relacion.estacionId,
      );

      relacion.isActive = true;

      const relacionRestaurada =
        await rutaEstacionesRepository.save(relacion);

      await queryRunner.commitTransaction();

      return BaseResponseDto.confirmation(
        'Relacion ruta-estacion restaurada correctamente',
        relacionRestaurada,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleUnexpectedError(
        error,
        'Error al restaurar la relacion ruta-estacion',
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async saveRutaEstacionesBatch(
    rutaId: string,
    estaciones: RutaEstacionLoteItemDto[],
    rutaEstacionesRepository: Repository<RutaEstaciones>,
    rutasRepository: Repository<Rutas>,
    estacionesRepository: Repository<Estaciones>,
  ): Promise<RutaEstaciones[]> {
    this.validateId(rutaId, 'rutaId');
    this.validateBatchPayload(estaciones);

    await this.findRutaActivaOrFail(rutaId, rutasRepository);
    await this.validateEstacionesActivas(estaciones, estacionesRepository);
    await this.ensureBatchHasNoConflicts(
      rutaId,
      estaciones,
      rutaEstacionesRepository,
    );

    const relaciones = estaciones.map((item) =>
      rutaEstacionesRepository.create({
        rutaId,
        estacionId: item.estacionId,
        orden: item.orden,
        isActive: true,
      }),
    );

    return rutaEstacionesRepository.save(relaciones);
  }

  private async findRutaEstacionEntityOrFail(
    rutaId: string,
    estacionId: string,
    includeInactive = false,
  ): Promise<RutaEstaciones> {
    const relacion = await this.rutaEstacionesRepository.findOne({
      where: includeInactive
        ? { rutaId, estacionId }
        : { rutaId, estacionId, isActive: true },
    });

    if (!relacion) {
      throw new NotFoundException(
        `No se encontro la relacion ruta-estacion para ruta ${rutaId} y estacion ${estacionId}`,
      );
    }

    return relacion;
  }

  private async findRutaActivaOrFail(
    rutaId: string,
    rutasRepository = this.rutasRepository,
  ): Promise<Rutas> {
    const ruta = await rutasRepository.findOne({
      where: { id: rutaId, isActive: true },
    });

    if (!ruta) {
      throw new NotFoundException(
        `No se encontro una ruta activa con id ${rutaId}`,
      );
    }

    return ruta;
  }

  private async findEstacionActivaOrFail(
    estacionId: string,
    estacionesRepository = this.estacionesRepository,
  ): Promise<Estaciones> {
    const estacion = await estacionesRepository.findOne({
      where: { id: estacionId, isActive: true },
    });

    if (!estacion) {
      throw new NotFoundException(
        `No se encontro una estacion activa con id ${estacionId}`,
      );
    }

    return estacion;
  }

  private async validateEstacionesActivas(
    estaciones: RutaEstacionLoteItemDto[],
    estacionesRepository: Repository<Estaciones>,
  ): Promise<void> {
    for (const estacion of estaciones) {
      this.validateId(estacion.estacionId, 'estacionId');
      await this.findEstacionActivaOrFail(
        estacion.estacionId,
        estacionesRepository,
      );
    }
  }

  private async ensureBatchHasNoConflicts(
    rutaId: string,
    estaciones: RutaEstacionLoteItemDto[],
    rutaEstacionesRepository: Repository<RutaEstaciones>,
  ): Promise<void> {
    const relacionesActivas = await rutaEstacionesRepository.find({
      where: { rutaId, isActive: true },
    });

    const estacionesExistentes = new Set(
      relacionesActivas.map((relacion) => relacion.estacionId),
    );
    const ordenesExistentes = new Set(
      relacionesActivas.map((relacion) => relacion.orden),
    );

    for (const estacion of estaciones) {
      if (estacionesExistentes.has(estacion.estacionId)) {
        throw new ConflictException(
          `La estacion ${estacion.estacionId} ya esta asociada a la ruta ${rutaId}`,
        );
      }

      if (ordenesExistentes.has(estacion.orden)) {
        throw new ConflictException(
          `Ya existe una estacion activa con el orden ${estacion.orden} en la ruta ${rutaId}`,
        );
      }
    }
  }

  private async ensureCompositeKeyAvailable(
    rutaId: string,
    estacionId: string,
    rutaEstacionesRepository: Repository<RutaEstaciones>,
    currentRutaId?: string,
    currentEstacionId?: string,
  ): Promise<void> {
    const existente = await rutaEstacionesRepository.findOne({
      where: { rutaId, estacionId, isActive: true },
    });

    if (
      existente &&
      (existente.rutaId !== currentRutaId ||
        existente.estacionId !== currentEstacionId)
    ) {
      throw new ConflictException(
        'La relacion ruta-estacion ya existe y se encuentra activa',
      );
    }
  }

  private async ensureOrdenAvailable(
    rutaId: string,
    orden: number,
    rutaEstacionesRepository: Repository<RutaEstaciones>,
    currentRutaId?: string,
    currentEstacionId?: string,
  ): Promise<void> {
    const existente = await rutaEstacionesRepository.findOne({
      where: { rutaId, orden, isActive: true },
    });

    if (
      existente &&
      (existente.rutaId !== currentRutaId ||
        existente.estacionId !== currentEstacionId)
    ) {
      throw new ConflictException(
        `Ya existe una estacion activa con el orden ${orden} en la ruta ${rutaId}`,
      );
    }
  }

  private validateCompositeIds(rutaId: string, estacionId: string): void {
    this.validateId(rutaId, 'rutaId');
    this.validateId(estacionId, 'estacionId');
  }

  private validateId(value: string, fieldName: string): void {
    if (!value?.trim() || !isUUID(value)) {
      throw new BadRequestException(
        `El campo ${fieldName} debe ser un UUID valido`,
      );
    }
  }

  private validateBatchPayload(estaciones: RutaEstacionLoteItemDto[]): void {
    const estacionIds = new Set<string>();
    const ordenes = new Set<number>();

    for (const estacion of estaciones) {
      if (estacionIds.has(estacion.estacionId)) {
        throw new ConflictException(
          `La estacion ${estacion.estacionId} esta duplicada en el lote`,
        );
      }

      if (ordenes.has(estacion.orden)) {
        throw new ConflictException(
          `El orden ${estacion.orden} esta duplicado en el lote`,
        );
      }

      estacionIds.add(estacion.estacionId);
      ordenes.add(estacion.orden);
    }
  }

  private handleUnexpectedError(error: unknown, message: string): never {
    if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException(message);
  }
}
