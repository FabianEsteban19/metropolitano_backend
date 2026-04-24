import { Injectable } from '@nestjs/common';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';

@Injectable()
export class BusesService {
  create(createBusDto: CreateBusDto) {
    return 'This action adds a new bus';
  }

  findAll() {
    return `This action returns all buses`;
  }

  findOne(id: string) {
    return `This action returns a #${id} bus`;
  }

  update(id: string, updateBusDto: UpdateBusDto) {
    return `This action updates a #${id} bus`;
  }

  remove(id: string) {
    return `This action removes a #${id} bus`;
  }
}
