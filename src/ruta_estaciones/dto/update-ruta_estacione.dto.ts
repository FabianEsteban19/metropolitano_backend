import { PartialType } from '@nestjs/mapped-types';
import { CreateRutaEstacioneDto } from './create-ruta_estacione.dto';

export class UpdateRutaEstacioneDto extends PartialType(CreateRutaEstacioneDto) {}
