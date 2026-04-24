import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsUUID, Min } from 'class-validator';

export class CreateRutaEstacioneDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Id de la ruta.',
    format: 'uuid',
  })
  @IsUUID()
  rutaId!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Id de la estacion.',
    format: 'uuid',
  })
  @IsUUID()
  estacionId!: string;

  @ApiProperty({
    example: 3,
    description: 'Posicion de la estacion dentro de la ruta.',
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  orden!: number;
}
