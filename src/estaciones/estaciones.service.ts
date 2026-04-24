import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { CreateEstacioneDto } from './dto/create-estacione.dto';
import { UpdateEstacioneDto } from './dto/update-estacione.dto';
import { Repository } from 'typeorm';
import { Estaciones } from './entities/Estaciones';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';

@Injectable()
export class EstacionesService {
  constructor(
    @InjectRepository(Estaciones)
    private readonly estacionesRepository: Repository<Estaciones>,
  ) {}

  async create(
    createEstacioneDto: CreateEstacioneDto,
  ): Promise<BaseResponseDto<Estaciones>> {
    try {
      const nuevaEstacion = this.estacionesRepository.create(
        this.mapCreateDtoToEntityInput(createEstacioneDto),
      );
      const estacionGuardada =
        await this.estacionesRepository.save(nuevaEstacion);

      return BaseResponseDto.success<Estaciones>(
        'Estacion creada correctamente',
        estacionGuardada,
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al crear la estacion');
    }
  }

  async findAll(): Promise<BaseResponseDto<Estaciones[]>> {
    try {
      const estaciones = await this.estacionesRepository.find({
        order: { orden: 'ASC', id: 'ASC' },
      });

      const message =
        estaciones.length > 0
          ? 'Estaciones obtenidas correctamente'
          : 'No hay estaciones registradas';

      return BaseResponseDto.success<Estaciones[]>(message, estaciones);
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al obtener las estaciones');
    }
  }

  async findOne(id: string): Promise<BaseResponseDto<Estaciones>> {
    try {
      this.validateId(id);

      const estacion = await this.findEstacionEntityOrFail(id);

      return BaseResponseDto.success<Estaciones>(
        'Estacion encontrada',
        estacion,
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al obtener la estacion');
    }
  }

  async update(
    id: string,
    updateEstacioneDto: UpdateEstacioneDto,
  ): Promise<BaseResponseDto<Estaciones>> {
    try {
      this.validateId(id);

      if (Object.keys(updateEstacioneDto).length === 0) {
        throw new BadRequestException(
          'Debes enviar al menos un campo para actualizar',
        );
      }

      const estacion = await this.findEstacionEntityOrFail(id);

      this.estacionesRepository.merge(
        estacion,
        this.mapUpdateDtoToEntityInput(updateEstacioneDto),
      );
      const estacionActualizada = await this.estacionesRepository.save(estacion);

      return BaseResponseDto.confirmation<Estaciones>(
        'Estacion actualizada correctamente',
        estacionActualizada,
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al actualizar la estacion');
    }
  }

  async remove(id: string): Promise<BaseResponseDto<Estaciones>> {
    try {
      this.validateId(id);

      const estacion = await this.findEstacionEntityOrFail(id);

      await this.estacionesRepository.remove(estacion);

      return BaseResponseDto.confirmation<Estaciones>(
        'Estacion eliminada correctamente',
        estacion,
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al eliminar la estacion');
    }
  }

  private async findEstacionEntityOrFail(id: string): Promise<Estaciones> {
    const estacion = await this.estacionesRepository.findOne({
      where: { id },
    });

    if (!estacion) {
      throw new NotFoundException(`No se encontro la estacion con id ${id}`);
    }

    return estacion;
  }

  private validateId(id: string): void {
    if (!id?.trim() || !isUUID(id)) {
      throw new BadRequestException('El id debe ser un UUID valido');
    }
  }

  private mapCreateDtoToEntityInput(
    dto: CreateEstacioneDto,
  ): Partial<Estaciones> {
    return {
      nombre: dto.nombre,
      distrito: dto.distrito,
      latitud: dto.latitud.toString(),
      longitud: dto.longitud.toString(),
      orden: dto.orden,
    };
  }

  private mapUpdateDtoToEntityInput(
    dto: UpdateEstacioneDto,
  ): Partial<Estaciones> {
    const updateData: Partial<Estaciones> = {};

    if (dto.nombre !== undefined) {
      updateData.nombre = dto.nombre;
    }

    if (dto.distrito !== undefined) {
      updateData.distrito = dto.distrito;
    }

    if (dto.latitud !== undefined) {
      updateData.latitud = dto.latitud.toString();
    }

    if (dto.longitud !== undefined) {
      updateData.longitud = dto.longitud.toString();
    }

    if (dto.orden !== undefined) {
      updateData.orden = dto.orden;
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
