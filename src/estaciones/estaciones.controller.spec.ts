import { Test, TestingModule } from '@nestjs/testing';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { CreateEstacioneDto } from './dto/create-estacione.dto';
import { UpdateEstacioneDto } from './dto/update-estacione.dto';
import { EstacionesController } from './estaciones.controller';
import { Estaciones } from './entities/Estaciones';
import { EstacionesService } from './estaciones.service';

describe('EstacionesController', () => {
  let controller: EstacionesController;
  let service: jest.Mocked<EstacionesService>;
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

  const estacionesServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstacionesController],
      providers: [
        {
          provide: EstacionesService,
          useValue: estacionesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<EstacionesController>(EstacionesController);
    service = module.get(EstacionesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe delegar create al service', async () => {
    const response = BaseResponseDto.success(
      'Estacion creada correctamente',
      estacionEntity,
    );
    service.create.mockResolvedValue(response);

    const result = await controller.create(createEstacionDto);

    expect(service.create).toHaveBeenCalledWith(createEstacionDto);
    expect(result).toEqual(response);
  });

  it('debe delegar findAll al service', async () => {
    const response = BaseResponseDto.success(
      'Estaciones obtenidas correctamente',
      [estacionEntity],
    );
    service.findAll.mockResolvedValue(response);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(response);
  });

  it('debe delegar findOne al service', async () => {
    const response = BaseResponseDto.success(
      'Estacion encontrada',
      estacionEntity,
    );
    service.findOne.mockResolvedValue(response);

    const result = await controller.findOne(estacionId);

    expect(service.findOne).toHaveBeenCalledWith(estacionId);
    expect(result).toEqual(response);
  });

  it('debe delegar update al service', async () => {
    const updateEstacionDto: UpdateEstacioneDto = { distrito: 'Barranco' };
    const response = BaseResponseDto.confirmation(
      'Estacion actualizada correctamente',
      { ...estacionEntity, ...updateEstacionDto },
    );
    service.update.mockResolvedValue(response);

    const result = await controller.update(estacionId, updateEstacionDto);

    expect(service.update).toHaveBeenCalledWith(estacionId, updateEstacionDto);
    expect(result).toEqual(response);
  });

  it('debe delegar remove al service', async () => {
    const response = BaseResponseDto.confirmation(
      'Estacion eliminada correctamente',
      estacionEntity,
    );
    service.remove.mockResolvedValue(response);

    const result = await controller.remove(estacionId);

    expect(service.remove).toHaveBeenCalledWith(estacionId);
    expect(result).toEqual(response);
  });
});
