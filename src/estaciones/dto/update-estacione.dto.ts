import { PartialType } from '@nestjs/swagger';
import { CreateEstacioneDto } from './create-estacione.dto';

export class UpdateEstacioneDto extends PartialType(CreateEstacioneDto) {}
