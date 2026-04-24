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
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';
import { Repository } from 'typeorm';
import { Buses } from './entities/Buses';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';

@Injectable()
export class BusesService {
  constructor(
    @InjectRepository(Buses)
    private readonly busRepository: Repository<Buses>,
  ) {}

  async create(createBusDto: CreateBusDto): Promise<BaseResponseDto<Buses>> {
    try {
      const busExistente = await this.findBusByCodigo(createBusDto.codigo.trim());
      if (busExistente) {
        throw new ConflictException(
          `Ya existe un bus con el codigo ${createBusDto.codigo}`,
        );
      }

      const nuevoBus = this.busRepository.create(
        this.mapCreateDtoToEntityInput(createBusDto),
      );
      const busGuardado = await this.busRepository.save(nuevoBus);
      return BaseResponseDto.success('Bus creado correctamente', busGuardado);
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al crear el bus');
    }
  }

  async findAll(): Promise<BaseResponseDto<Buses[]>> {
    try {
      const buses = await this.busRepository.find({
        where: { isActive: true },
        order: { createdAt: 'ASC' },
      });

      const message =
        buses.length > 0
          ? 'Buses encontrados correctamente'
          : 'No hay buses registrados';

      return BaseResponseDto.success(message, buses);
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al obtener los buses');
    }
  }

  async findOne(id: string): Promise<BaseResponseDto<Buses>> {
    try {
      this.validateId(id);

      const bus = await this.findBusEntityOrFail(id);

      return BaseResponseDto.success('Bus encontrado correctamente', bus);
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al obtener el bus');
    }
  }

  async update(
    id: string,
    updateBusDto: UpdateBusDto,
  ): Promise<BaseResponseDto<Buses>> {
    try {
      this.validateId(id);

      if (Object.keys(updateBusDto).length === 0) {
        throw new BadRequestException(
          'Debes enviar al menos un campo para actualizar',
        );
      }

      const bus = await this.findBusEntityOrFail(id);

      if (updateBusDto.codigo && updateBusDto.codigo.trim() !== bus.codigo) {
        const busConMismoCodigo = await this.findBusByCodigo(
          updateBusDto.codigo.trim(),
        );

        if (busConMismoCodigo && busConMismoCodigo.id !== bus.id) {
          throw new ConflictException(
            `Ya existe un bus con el codigo ${updateBusDto.codigo}`,
          );
        }
      }

      this.busRepository.merge(bus, this.mapUpdateDtoToEntityInput(updateBusDto));
      const busActualizado = await this.busRepository.save(bus);

      return BaseResponseDto.confirmation(
        'Bus actualizado correctamente',
        busActualizado,
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al actualizar el bus');
    }
  }

  async remove(id: string): Promise<BaseResponseDto<Buses>> {
    try {
      this.validateId(id);

      const bus = await this.findBusEntityOrFail(id);
      bus.isActive = false;

      const busDesactivado = await this.busRepository.save(bus);

      return BaseResponseDto.confirmation(
        'Bus desactivado correctamente',
        busDesactivado,
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al desactivar el bus');
    }
  }

  async restore(id: string): Promise<BaseResponseDto<Buses>> {
    try {
      this.validateId(id);

      const bus = await this.findBusEntityOrFail(id, true);

      if (bus.isActive) {
        throw new BadRequestException('El bus ya se encuentra activo');
      }

      bus.isActive = true;

      const busRestaurado = await this.busRepository.save(bus);

      return BaseResponseDto.confirmation(
        'Bus restaurado correctamente',
        busRestaurado,
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al restaurar el bus');
    }
  }

  private async findBusByCodigo(codigo: string): Promise<Buses | null> {
    return this.busRepository.findOne({
      where: { codigo },
    });
  }

  private async findBusEntityOrFail(
    id: string,
    includeInactive = false,
  ): Promise<Buses> {
    const bus = await this.busRepository.findOne({
      where: includeInactive ? { id } : { id, isActive: true },
    });

    if (!bus) {
      throw new NotFoundException(`No se encontro el bus con id ${id}`);
    }

    return bus;
  }

  private validateId(id: string): void {
    if (!id?.trim() || !isUUID(id)) {
      throw new BadRequestException('El id debe ser un UUID valido');
    }
  }

  private mapCreateDtoToEntityInput(
    createBusDto: CreateBusDto,
  ): Partial<Buses> {
    return {
      codigo: createBusDto.codigo.trim(),
      capacidad: createBusDto.capacidad,
      placa: createBusDto.placa?.trim() || null,
      rutaId: createBusDto.rutaId || null,
      estado: createBusDto.estado || 'fuera_servicio',
      isActive: true,
    };
  }

  private mapUpdateDtoToEntityInput(updateBusDto: UpdateBusDto): Partial<Buses> {
    const updateData: Partial<Buses> = {};
    if (updateBusDto.codigo !== undefined) {
      updateData.codigo = updateBusDto.codigo.trim();
    }
    if (updateBusDto.capacidad !== undefined) {
      updateData.capacidad = updateBusDto.capacidad;
    }
    if (updateBusDto.placa !== undefined) {
      updateData.placa = updateBusDto.placa?.trim() || null;
    }
    if (updateBusDto.rutaId !== undefined) {
      updateData.rutaId = updateBusDto.rutaId || null;
    }
    if (updateBusDto.estado !== undefined) {
      updateData.estado = updateBusDto.estado;
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
