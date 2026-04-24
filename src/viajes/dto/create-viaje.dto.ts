import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export enum ViajeEstado {
  PROGRAMADO = 'programado',
  EN_RECORRIDO = 'en_recorrido',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado',
  RETRASADO = 'retrasado',
}

export enum ViajeSentido {
  IDA = 'ida',
  VUELTA = 'vuelta',
}

export class CreateViajeDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  rutaId!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440002',
    format: 'uuid',
  })
  @IsUUID()
  busId!: string;

  @ApiProperty({
    example: '2026-04-24',
    format: 'date',
  })
  @IsDateString()
  fechaOperacion!: string;

  @ApiProperty({
    example: '2026-04-24T06:00:00.000Z',
    format: 'date-time',
  })
  @Type(() => Date)
  @IsDate()
  horaSalidaProgramada!: Date;

  @ApiPropertyOptional({
    example: '2026-04-24T06:03:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  horaSalidaReal?: Date;

  @ApiPropertyOptional({
    example: '2026-04-24T07:10:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  horaLlegadaProgramada?: Date;

  @ApiPropertyOptional({
    example: '2026-04-24T07:18:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  horaLlegadaReal?: Date;

  @ApiPropertyOptional({
    enum: ViajeEstado,
    enumName: 'ViajeEstado',
    example: ViajeEstado.PROGRAMADO,
  })
  @IsOptional()
  @IsEnum(ViajeEstado)
  estado?: ViajeEstado;

  @ApiPropertyOptional({
    enum: ViajeSentido,
    enumName: 'ViajeSentido',
    example: ViajeSentido.IDA,
  })
  @IsOptional()
  @IsEnum(ViajeSentido)
  sentido?: ViajeSentido;

  @ApiPropertyOptional({
    example: 'Salida con ligera demora por congestion.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  observaciones?: string;
}
