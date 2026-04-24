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
import { CreateRutaDto } from './dto/create-ruta.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';
import { Rutas } from './entities/Rutas';

@Injectable()
export class RutasService {
  constructor(
    @InjectRepository(Rutas)
    private readonly rutaRepository: Repository<Rutas>,
  ) {}

  async create(createRutaDto: CreateRutaDto): Promise<BaseResponseDto<Rutas>> {
    try {
      const rutaExistente = await this.rutaRepository.findOne({
        where: { codigo: createRutaDto.codigo.trim() },
      });

      if (rutaExistente) {
        throw new ConflictException(
          `Ya existe una ruta con el codigo ${createRutaDto.codigo}`,
        );
      }

      const nuevaRuta = this.rutaRepository.create({
        ...createRutaDto,
        isActive: true,
      });
      const rutaGuardada = await this.rutaRepository.save(nuevaRuta);

      return BaseResponseDto.success('Ruta creada correctamente', rutaGuardada);
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al crear la ruta');
    }
  }

  async findAll(): Promise<BaseResponseDto<Rutas[]>> {
    try {
      const rutas = await this.rutaRepository.find({
        where: { isActive: true },
        order: { id: 'ASC' },
      });

      const message =
        rutas.length > 0
          ? 'Rutas obtenidas correctamente'
          : 'No hay rutas registradas';

      return BaseResponseDto.success(message, rutas);
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al obtener las rutas');
    }
  }

  async findOne(id: string): Promise<BaseResponseDto<Rutas>> {
    try {
      this.validateId(id);

      const ruta = await this.findRutaEntityOrFail(id);

      return BaseResponseDto.success('Ruta encontrada', ruta);
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al obtener la ruta');
    }
  }

  async findRutaByCodigo(codigo: string): Promise<BaseResponseDto<Rutas>> {
    try {
      if (!codigo?.trim()) {
        throw new BadRequestException('El codigo es obligatorio');
      }

      const ruta = await this.findRutaByCodigoEntity(codigo.trim());

      if (!ruta) {
        throw new NotFoundException(
          `No se encontro una ruta con el codigo ${codigo}`,
        );
      }

      return BaseResponseDto.success('Ruta encontrada', ruta);
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al buscar la ruta por codigo');
    }
  }

  async update(
    id: string,
    updateRutaDto: UpdateRutaDto,
  ): Promise<BaseResponseDto<Rutas>> {
    try {
      this.validateId(id);

      if (Object.keys(updateRutaDto).length === 0) {
        throw new BadRequestException(
          'Debes enviar al menos un campo para actualizar',
        );
      }

      const ruta = await this.findRutaEntityOrFail(id);

      if (
        updateRutaDto.codigo &&
        updateRutaDto.codigo.trim() !== ruta.codigo
      ) {
        const rutaConMismoCodigo = await this.rutaRepository.findOne({
          where: { codigo: updateRutaDto.codigo.trim() },
        });

        if (rutaConMismoCodigo && rutaConMismoCodigo.id !== ruta.id) {
          throw new ConflictException(
            `Ya existe una ruta con el codigo ${updateRutaDto.codigo}`,
          );
        }
      }

      this.rutaRepository.merge(ruta, updateRutaDto);
      const rutaActualizada = await this.rutaRepository.save(ruta);

      return BaseResponseDto.confirmation(
        'Ruta actualizada correctamente',
        rutaActualizada,
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al actualizar la ruta');
    }
  }

  async remove(id: string): Promise<BaseResponseDto<Rutas>> {
    try {
      this.validateId(id);

      const ruta = await this.findRutaEntityOrFail(id);
      ruta.isActive = false;

      const rutaDesactivada = await this.rutaRepository.save(ruta);

      return BaseResponseDto.confirmation(
        'Ruta desactivada correctamente',
        rutaDesactivada,
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al desactivar la ruta');
    }
  }

  async restore(id: string): Promise<BaseResponseDto<Rutas>> {
    try {
      this.validateId(id);

      const ruta = await this.findRutaEntityOrFail(id, true);

      if (ruta.isActive) {
        throw new BadRequestException('La ruta ya se encuentra activa');
      }

      ruta.isActive = true;

      const rutaRestaurada = await this.rutaRepository.save(ruta);

      return BaseResponseDto.confirmation(
        'Ruta restaurada correctamente',
        rutaRestaurada,
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al restaurar la ruta');
    }
  }

  private async findRutaByCodigoEntity(codigo: string): Promise<Rutas | null> {
    return this.rutaRepository.findOne({
      where: { codigo, isActive: true },
    });
  }

  private async findRutaEntityOrFail(
    id: string,
    includeInactive = false,
  ): Promise<Rutas> {
    const ruta = await this.rutaRepository.findOne({
      where: includeInactive ? { id } : { id, isActive: true },
    });

    if (!ruta) {
      throw new NotFoundException(`No se encontro la ruta con id ${id}`);
    }

    return ruta;
  }

  private validateId(id: string): void {
    if (!id?.trim() || !isUUID(id)) {
      throw new BadRequestException('El id debe ser un UUID valido');
    }
  }

  private handleUnexpectedError(error: unknown, message: string): never {
    if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException(message);
  }
}
