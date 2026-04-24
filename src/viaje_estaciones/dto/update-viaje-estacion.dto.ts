import { PartialType } from '@nestjs/swagger';
import { CreateViajeEstacionDto } from './create-viaje-estacion.dto';

export class UpdateViajeEstacionDto extends PartialType(
  CreateViajeEstacionDto,
) {}
