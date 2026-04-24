import { Injectable } from '@nestjs/common';
import { CreateRutaEstacioneDto } from './dto/create-ruta_estacione.dto';
import { UpdateRutaEstacioneDto } from './dto/update-ruta_estacione.dto';

@Injectable()
export class RutaEstacionesService {
  create(createRutaEstacioneDto: CreateRutaEstacioneDto) {
    return 'This action adds a new rutaEstacione';
  }

  findAll() {
    return `This action returns all rutaEstaciones`;
  }

  findOne(id: string) {
    return `This action returns a #${id} rutaEstacione`;
  }

  update(id: string, updateRutaEstacioneDto: UpdateRutaEstacioneDto) {
    return `This action updates a #${id} rutaEstacione`;
  }

  remove(id: string) {
    return `This action removes a #${id} rutaEstacione`;
  }
}
