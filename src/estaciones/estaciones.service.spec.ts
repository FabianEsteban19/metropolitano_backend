import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { CreateEstacioneDto } from './dto/create-estacione.dto';
import { Estaciones } from './entities/Estaciones';
import { EstacionesService } from './estaciones.service';

type MockRepository<T extends object = object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createRepositoryMock = (): MockRepository<Estaciones> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  merge: jest.fn(),
});

describe('EstacionesService', () => {
  let service: EstacionesService;
  let repository: MockRepository<Estaciones>;

  const estacionId = '550e8400-e29b-41d4-a716-446655440001';

  const estacionEntity: Estaciones = {
    id: estacionId,
    nombre: 'Estacion Central',
    distrito: 'Lima',
    latitud: '-12.0463740',
    longitud: '-77.0427930',
    orden: 1,
    isActive: true,
    reportes: [],
    rutaEstaciones: [],
  };

  const createEstacionDto: CreateEstacioneDto = {
    nombre: 'Estacion Central',
    distrito: 'Lima',
    latitud: -12.046374,
    longitud: -77.042793,
    orden: 1,
  };

  beforeEach(async () => {
    repository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstacionesService,
        {
          provide: getRepositoryToken(Estaciones),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<EstacionesService>(EstacionesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe crear una estacion correctamente', async () => {
    repository.create!.mockReturnValue(estacionEntity);
    repository.save!.mockResolvedValue(estacionEntity);

    const result = await service.create(createEstacionDto);

    expect(repository.create).toHaveBeenCalledWith({
      nombre: createEstacionDto.nombre,
      distrito: createEstacionDto.distrito,
      latitud: createEstacionDto.latitud.toString(),
      longitud: createEstacionDto.longitud.toString(),
      orden: createEstacionDto.orden,
      isActive: true,
    });
    expect(result).toEqual(
      BaseResponseDto.success('Estacion creada correctamente', estacionEntity),
    );
  });

  it('debe listar solo estaciones activas', async () => {
    repository.find!.mockResolvedValue([estacionEntity]);

    const result = await service.findAll();

    expect(repository.find).toHaveBeenCalledWith({
      where: { isActive: true },
      order: { orden: 'ASC', id: 'ASC' },
    });
    expect(result).toEqual(
      BaseResponseDto.success('Estaciones obtenidas correctamente', [
        estacionEntity,
      ]),
    );
  });

  it('debe desactivar una estacion con remove', async () => {
    repository.findOne!.mockResolvedValue(estacionEntity);
    repository.save!.mockResolvedValue({ ...estacionEntity, isActive: false });

    const result = await service.remove(estacionId);

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: estacionId, isActive: false }),
    );
    expect(result).toEqual(
      BaseResponseDto.confirmation('Estacion desactivada correctamente', {
        ...estacionEntity,
        isActive: false,
      }),
    );
  });

  it('debe restaurar una estacion inactiva', async () => {
    repository.findOne!.mockResolvedValue({ ...estacionEntity, isActive: false });
    repository.save!.mockResolvedValue({ ...estacionEntity, isActive: true });

    const result = await service.restore(estacionId);

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: estacionId, isActive: true }),
    );
    expect(result).toEqual(
      BaseResponseDto.confirmation('Estacion restaurada correctamente', {
        ...estacionEntity,
        isActive: true,
      }),
    );
  });

  it('debe lanzar bad request si el id no es UUID', async () => {
    await expect(service.findOne('id-invalido')).rejects.toThrow(
      BadRequestException,
    );
  });
});
