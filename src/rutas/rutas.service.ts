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
import { CreateRutaDto } from './dto/create-ruta.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';
import { Repository } from 'typeorm';
import { Rutas } from './entities/Rutas';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';

@Injectable()
export class RutasService {
  constructor(
    @InjectRepository(Rutas)
    private readonly rutaRepository: Repository<Rutas>,
  ) {}

  //Metodo para crear una nueva ruta. Verifica que no exista una ruta con el mismo codigo antes de crearla.
  async create(createRutaDto: CreateRutaDto): Promise<BaseResponseDto<Rutas>> {
    try {
      const rutaExistente = await this.rutaRepository.findOne({
        where: { codigo: createRutaDto.codigo.trim() },
      });

      // Si ya existe una ruta con el mismo codigo, lanza un error de conflicto
      if (rutaExistente) {
        throw new ConflictException(
          `Ya existe una ruta con el codigo ${createRutaDto.codigo}`,
        );
      }

      // Crea la nueva ruta y la guarda en la base de datos

      const nuevaRuta = this.rutaRepository.create(createRutaDto);
      const rutaGuardada = await this.rutaRepository.save(nuevaRuta);

      return BaseResponseDto.success('Ruta creada correctamente', rutaGuardada);
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al crear la ruta');
    }
  }

  async findAll(): Promise<BaseResponseDto<Rutas[]>> {
    try {
      const rutas = await this.rutaRepository.find({
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

  async findOne(code: string): Promise<BaseResponseDto<Rutas>> {
    try {

      const ruta = await this.findRutaByCodigo(code);

      return BaseResponseDto.success('Ruta encontrada', ruta.data!);
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al obtener la ruta');
    }
  }

  async findRutaByCodigo(codigo: string): Promise<BaseResponseDto<Rutas>> {
    try {
      if (!codigo?.trim()) {
        throw new BadRequestException('El codigo es obligatorio');
      }

      const ruta = await this.rutaRepository.findOne({
        where: { codigo: codigo.trim() },
      });

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

      if (Object.keys(updateRutaDto).length === 0) {
        throw new BadRequestException(
          'Debes enviar al menos un campo para actualizar',
        );
      }

      const ruta = await this.findRutaByCodigo(id);

      if (
        updateRutaDto.codigo &&
        updateRutaDto.codigo.trim() !== ruta.data!.codigo
      ) {
        const rutaConMismoCodigo = await this.rutaRepository.findOne({
          where: { codigo: updateRutaDto.codigo.trim() },
        });

        if (rutaConMismoCodigo && rutaConMismoCodigo.id !== ruta.data!.id) {
          throw new ConflictException(
            `Ya existe una ruta con el codigo ${updateRutaDto.codigo}`,
          );
        }
      }

      this.rutaRepository.merge(ruta.data!, updateRutaDto);
      const rutaActualizada = await this.rutaRepository.save(ruta.data!);

      return BaseResponseDto.confirmation(
        'Ruta actualizada correctamente',
        rutaActualizada,
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al actualizar la ruta');
    }
  }

  async remove(code: string): Promise<BaseResponseDto<Rutas>> {
    try {

      const ruta = await this.findRutaByCodigo(code);

      await this.rutaRepository.remove(ruta.data!);

      return BaseResponseDto.confirmation('Ruta eliminada correctamente', ruta!.data!);
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al eliminar la ruta');
    }
  }



  private handleUnexpectedError(error: unknown, message: string): never {
    if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException(message);
  }
}
