import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateReporteDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440010',
    description: 'Id del bus que genera el reporte.',
    format: 'uuid',
  })
  @IsUUID()
  busId!: string;

  @ApiProperty({
    example: -12.046374,
    description: 'Latitud reportada por el bus.',
    minimum: -90,
    maximum: 90,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-90)
  @Max(90)
  latitud!: number;

  @ApiProperty({
    example: -77.042793,
    description: 'Longitud reportada por el bus.',
    minimum: -180,
    maximum: 180,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-180)
  @Max(180)
  longitud!: number;

  @ApiProperty({
    example: 42,
    description: 'Cantidad de pasajeros presentes al momento del reporte.',
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cantidadPasajeros!: number;

  @ApiPropertyOptional({
    example: '2026-04-23T18:30:00.000Z',
    description: 'Fecha y hora del reporte. Si no se envia, la BD usa now().',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  timestamp?: Date;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440011',
    description: 'Id de la estacion asociada al reporte.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  estacionId?: string;

  @ApiPropertyOptional({
    example: 52.5,
    description: 'Porcentaje de ocupacion del bus.',
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  ocupacionPct?: number;

  @ApiPropertyOptional({
    example: 34.8,
    description: 'Velocidad del bus en km/h.',
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  velocidadKmh?: number;
}
