import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export enum BusEstado {
  EN_RUTA = 'en_ruta',
  EN_ESTACION = 'en_estacion',
  FUERA_SERVICIO = 'fuera_servicio',
  RETRASO = 'retraso',
}

export class CreateBusDto {
  @ApiProperty({
    example: 'BUS-001',
    description: 'Codigo interno unico del bus.',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  codigo!: string;

  @ApiProperty({
    example: 80,
    description: 'Capacidad total del bus.',
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacidad!: number;

  @ApiPropertyOptional({
    example: 'ABC-123',
    description: 'Placa del bus.',
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  placa?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Id de la ruta asignada al bus.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  rutaId?: string;

  @ApiPropertyOptional({
    enum: BusEstado,
    enumName: 'BusEstado',
    example: BusEstado.FUERA_SERVICIO,
    default: BusEstado.FUERA_SERVICIO,
    description: 'Estado operativo actual del bus.',
  })
  @IsOptional()
  @IsEnum(BusEstado)
  estado?: BusEstado;
}
