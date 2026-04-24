import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { CreateRutaDto, RutaServicio } from './dto/create-ruta.dto';
import { Rutas } from './entities/Rutas';
import { RutasService } from './rutas.service';

type MockRepository<T extends object = object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createRepositoryMock = (): MockRepository<Rutas> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  merge: jest.fn(),
  remove: jest.fn(),
});

describe('RutasService', () => {
  let service: RutasService;
  let repository: MockRepository<Rutas>;
  const rutaId = '550e8400-e29b-41d4-a716-446655440000';

  const rutaEntity: Rutas = {
    id: rutaId,
    codigo: 'A',
    nombre: 'Ruta A',
    servicio: 'Regular',
    color: '#D62828',
    frecuenciaMin: 5,
    buses: [],
    rutaEstaciones: [],
  };

  const createRutaDto: CreateRutaDto = {
    codigo: 'A',
    nombre: 'Ruta A',
    servicio: RutaServicio.REGULAR,
    color: '#D62828',
    frecuenciaMin: 5,
  };

  beforeEach(async () => {
    repository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RutasService,
        {
          provide: getRepositoryToken(Rutas),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<RutasService>(RutasService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe crear una ruta correctamente', async () => {
    repository.findOne!.mockResolvedValue(null);
    repository.create!.mockReturnValue(rutaEntity);
    repository.save!.mockResolvedValue(rutaEntity);

    const result = await service.create(createRutaDto);

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { codigo: createRutaDto.codigo },
    });
    expect(repository.create).toHaveBeenCalledWith(createRutaDto);
    expect(repository.save).toHaveBeenCalledWith(rutaEntity);
    expect(result).toEqual(
      BaseResponseDto.success('Ruta creada correctamente', rutaEntity),
    );
  });

  it('debe lanzar conflicto si el codigo ya existe al crear', async () => {
    repository.findOne!.mockResolvedValue(rutaEntity);

    await expect(service.create(createRutaDto)).rejects.toThrow(
      ConflictException,
    );
  });

  it('debe listar rutas correctamente', async () => {
    repository.find!.mockResolvedValue([rutaEntity]);

    const result = await service.findAll();

    expect(repository.find).toHaveBeenCalledWith({
      order: { id: 'ASC' },
    });
    expect(result).toEqual(
      BaseResponseDto.success('Rutas obtenidas correctamente', [rutaEntity]),
    );
  });

  it('debe devolver mensaje vacio si no hay rutas', async () => {
    repository.find!.mockResolvedValue([]);

    const result = await service.findAll();

    expect(result).toEqual(
      BaseResponseDto.success('No hay rutas registradas', []),
    );
  });

  it('debe obtener una ruta por id', async () => {
    repository.findOne!.mockResolvedValue(rutaEntity);

    const result = await service.findOne(rutaId);

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: rutaId },
    });
    expect(result).toEqual(
      BaseResponseDto.success('Ruta encontrada', rutaEntity),
    );
  });

  it('debe lanzar bad request si el id es invalido', async () => {
    await expect(service.findOne('id-invalido')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('debe lanzar not found si no existe la ruta por id', async () => {
    repository.findOne!.mockResolvedValue(null);

    await expect(
      service.findOne('550e8400-e29b-41d4-a716-446655440999'),
    ).rejects.toThrow(NotFoundException);
  });

  it('debe obtener una ruta por codigo', async () => {
    repository.findOne!.mockResolvedValue(rutaEntity);

    const result = await service.findRutaByCodigo('A');

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { codigo: 'A' },
    });
    expect(result).toEqual(
      BaseResponseDto.success('Ruta encontrada', rutaEntity),
    );
  });

  it('debe actualizar una ruta correctamente', async () => {
    const updateDto = { nombre: 'Ruta Actualizada', codigo: 'B' };
    const rutaActualizada = {
      ...rutaEntity,
      ...updateDto,
    };

    repository.findOne!.mockImplementation(({ where }: { where: Record<string, string> }) => {
      if (where.id === rutaId) {
        return Promise.resolve(rutaEntity);
      }

      if (where.codigo === 'B') {
        return Promise.resolve(null);
      }

      return Promise.resolve(null);
    });
    repository.merge!.mockImplementation((target, source) =>
      Object.assign(target, source),
    );
    repository.save!.mockResolvedValue(rutaActualizada);

    const result = await service.update(rutaId, updateDto);

    expect(repository.merge).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining(rutaActualizada),
    );
    expect(result).toEqual(
      BaseResponseDto.confirmation(
        'Ruta actualizada correctamente',
        rutaActualizada,
      ),
    );
  });

  it('debe lanzar bad request si update no recibe campos', async () => {
    await expect(service.update(rutaId, {})).rejects.toThrow(
      BadRequestException,
    );
  });

  it('debe eliminar una ruta correctamente', async () => {
    repository.findOne!.mockResolvedValue(rutaEntity);
    repository.remove!.mockResolvedValue(rutaEntity);

    const result = await service.remove(rutaId);

    expect(repository.remove).toHaveBeenCalledWith(rutaEntity);
    expect(result).toEqual(
      BaseResponseDto.confirmation('Ruta eliminada correctamente', rutaEntity),
    );
  });
});
