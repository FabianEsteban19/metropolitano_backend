import { PartialType } from '@nestjs/swagger';
import { CreateRutaEstacioneDto } from './create-ruta_estacione.dto';

export class UpdateRutaEstacioneDto extends PartialType(CreateRutaEstacioneDto) {}
