import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class RutaEstacionLoteItemDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Id de la estacion.',
    format: 'uuid',
  })
  @IsUUID()
  estacionId!: string;

  @ApiProperty({
    example: 1,
    description: 'Posicion de la estacion dentro de la ruta.',
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  orden!: number;
}

export class CreateRutaEstacionesLoteDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Id de la ruta a configurar.',
    format: 'uuid',
  })
  @IsUUID()
  rutaId!: string;

  @ApiProperty({
    type: [RutaEstacionLoteItemDto],
    description: 'Listado de estaciones a registrar para la ruta.',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RutaEstacionLoteItemDto)
  estaciones!: RutaEstacionLoteItemDto[];
}
