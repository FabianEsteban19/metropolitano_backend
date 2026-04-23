import { PartialType } from '@nestjs/mapped-types';
import { CreateEstacioneDto } from './create-estacione.dto';

export class UpdateEstacioneDto extends PartialType(CreateEstacioneDto) {}
