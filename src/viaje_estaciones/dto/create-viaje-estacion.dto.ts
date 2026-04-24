import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export enum ViajeEstacionEstado {
  PENDIENTE = 'pendiente',
  A_TIEMPO = 'a_tiempo',
  TARDE = 'tarde',
  OMITIDA = 'omitida',
}

export class CreateViajeEstacionDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440010',
    format: 'uuid',
  })
  @IsUUID()
  viajeId!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  @IsUUID()
  estacionId!: string;

  @ApiProperty({
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  orden!: number;

  @ApiPropertyOptional({
    example: '2026-04-24T06:15:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  horaLlegadaProgramada?: Date;

  @ApiPropertyOptional({
    example: '2026-04-24T06:17:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  horaLlegadaReal?: Date;

  @ApiPropertyOptional({
    example: '2026-04-24T06:16:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  horaSalidaProgramada?: Date;

  @ApiPropertyOptional({
    example: '2026-04-24T06:18:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  horaSalidaReal?: Date;

  @ApiPropertyOptional({
    enum: ViajeEstacionEstado,
    enumName: 'ViajeEstacionEstado',
    example: ViajeEstacionEstado.PENDIENTE,
  })
  @IsOptional()
  @IsEnum(ViajeEstacionEstado)
  estadoCumplimiento?: ViajeEstacionEstado;

  @ApiPropertyOptional({
    example: 'Parada con alta demanda.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  observaciones?: string;
}
