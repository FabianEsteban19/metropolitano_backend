import { Test, TestingModule } from '@nestjs/testing';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { CreateRutaDto, RutaServicio } from './dto/create-ruta.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';
import { RutasController } from './rutas.controller';
import { Rutas } from './entities/Rutas';
import { RutasService } from './rutas.service';

describe('RutasController', () => {
  let controller: RutasController;
  let service: jest.Mocked<RutasService>;
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

  const rutasServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findRutaByCodigo: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RutasController],
      providers: [
        {
          provide: RutasService,
          useValue: rutasServiceMock,
        },
      ],
    }).compile();

    controller = module.get<RutasController>(RutasController);
    service = module.get(RutasService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe delegar create al service', async () => {
    const response = BaseResponseDto.success('Ruta creada correctamente', rutaEntity);
    service.create.mockResolvedValue(response);

    const result = await controller.create(createRutaDto);

    expect(service.create).toHaveBeenCalledWith(createRutaDto);
    expect(result).toEqual(response);
  });

  it('debe delegar findAll al service', async () => {
    const response = BaseResponseDto.success('Rutas obtenidas correctamente', [
      rutaEntity,
    ]);
    service.findAll.mockResolvedValue(response);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(response);
  });

  it('debe delegar findByCodigo al service', async () => {
    const response = BaseResponseDto.success('Ruta encontrada', rutaEntity);
    service.findRutaByCodigo.mockResolvedValue(response);

    const result = await controller.findByCodigo('A');

    expect(service.findRutaByCodigo).toHaveBeenCalledWith('A');
    expect(result).toEqual(response);
  });

  it('debe delegar findOne al service', async () => {
    const response = BaseResponseDto.success('Ruta encontrada', rutaEntity);
    service.findOne.mockResolvedValue(response);

    const result = await controller.findOne(rutaId);

    expect(service.findOne).toHaveBeenCalledWith(rutaId);
    expect(result).toEqual(response);
  });

  it('debe delegar update al service', async () => {
    const updateRutaDto: UpdateRutaDto = { nombre: 'Ruta Editada' };
    const response = BaseResponseDto.confirmation(
      'Ruta actualizada correctamente',
      { ...rutaEntity, ...updateRutaDto },
    );
    service.update.mockResolvedValue(response);

    const result = await controller.update(rutaId, updateRutaDto);

    expect(service.update).toHaveBeenCalledWith(rutaId, updateRutaDto);
    expect(result).toEqual(response);
  });

  it('debe delegar remove al service', async () => {
    const response = BaseResponseDto.confirmation(
      'Ruta eliminada correctamente',
      rutaEntity,
    );
    service.remove.mockResolvedValue(response);

    const result = await controller.remove(rutaId);

    expect(service.remove).toHaveBeenCalledWith(rutaId);
    expect(result).toEqual(response);
  });
});
