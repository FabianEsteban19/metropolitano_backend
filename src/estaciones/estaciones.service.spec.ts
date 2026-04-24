import { BadRequestException, NotFoundException } from '@nestjs/common';
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
  remove: jest.fn(),
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
    });
    expect(repository.save).toHaveBeenCalledWith(estacionEntity);
    expect(result).toEqual(
      BaseResponseDto.success('Estacion creada correctamente', estacionEntity),
    );
  });

  it('debe listar estaciones correctamente', async () => {
    repository.find!.mockResolvedValue([estacionEntity]);

    const result = await service.findAll();

    expect(repository.find).toHaveBeenCalledWith({
      order: { orden: 'ASC', id: 'ASC' },
    });
    expect(result).toEqual(
      BaseResponseDto.success('Estaciones obtenidas correctamente', [
        estacionEntity,
      ]),
    );
  });

  it('debe devolver mensaje vacio si no hay estaciones', async () => {
    repository.find!.mockResolvedValue([]);

    const result = await service.findAll();

    expect(result).toEqual(
      BaseResponseDto.success('No hay estaciones registradas', []),
    );
  });

  it('debe obtener una estacion por id', async () => {
    repository.findOne!.mockResolvedValue(estacionEntity);

    const result = await service.findOne(estacionId);

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: estacionId },
    });
    expect(result).toEqual(
      BaseResponseDto.success('Estacion encontrada', estacionEntity),
    );
  });

  it('debe lanzar bad request si el id es invalido', async () => {
    await expect(service.findOne('id-invalido')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('debe lanzar not found si no existe la estacion por id', async () => {
    repository.findOne!.mockResolvedValue(null);

    await expect(
      service.findOne('550e8400-e29b-41d4-a716-446655440999'),
    ).rejects.toThrow(NotFoundException);
  });

  it('debe actualizar una estacion correctamente', async () => {
    const updateDto = { distrito: 'Barranco', orden: 2 };
    const estacionActualizada = {
      ...estacionEntity,
      ...updateDto,
    };

    repository.findOne!.mockResolvedValue(estacionEntity);
    repository.merge!.mockImplementation((target, source) =>
      Object.assign(target, source),
    );
    repository.save!.mockResolvedValue(estacionActualizada);

    const result = await service.update(estacionId, updateDto);

    expect(repository.merge).toHaveBeenCalledWith(estacionEntity, {
      distrito: updateDto.distrito,
      orden: updateDto.orden,
    });
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining(estacionActualizada),
    );
    expect(result).toEqual(
      BaseResponseDto.confirmation(
        'Estacion actualizada correctamente',
        estacionActualizada,
      ),
    );
  });

  it('debe lanzar bad request si update no recibe campos', async () => {
    await expect(service.update(estacionId, {})).rejects.toThrow(
      BadRequestException,
    );
  });

  it('debe eliminar una estacion correctamente', async () => {
    repository.findOne!.mockResolvedValue(estacionEntity);
    repository.remove!.mockResolvedValue(estacionEntity);

    const result = await service.remove(estacionId);

    expect(repository.remove).toHaveBeenCalledWith(estacionEntity);
    expect(result).toEqual(
      BaseResponseDto.confirmation(
        'Estacion eliminada correctamente',
        estacionEntity,
      ),
    );
  });
});
