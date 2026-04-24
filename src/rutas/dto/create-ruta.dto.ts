import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export enum RutaServicio {
  REGULAR = 'Regular',
  EXPRESO_1 = 'Expreso_1',
  EXPRESO_2 = 'Expreso_2',
  EXPRESO_4 = 'Expreso_4',
  EXPRESO_5 = 'Expreso_5',
  EXPRESO_7 = 'Expreso_7',
  SUPER_EXPRESO = 'SuperExpreso',
  ALIMENTADOR = 'Alimentador',
}

export class CreateRutaDto {
  @ApiProperty({
    example: 'A',
    description: 'Codigo unico de la ruta.',
    maxLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  codigo!: string;

  @ApiProperty({
    example: 'Ruta Troncal Naranjal - Matellini',
    description: 'Nombre visible de la ruta.',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiProperty({
    enum: RutaServicio,
    enumName: 'RutaServicio',
    example: RutaServicio.REGULAR,
    description: 'Tipo de servicio de la ruta.',
  })
  @IsEnum(RutaServicio)
  servicio!: RutaServicio;

  @ApiProperty({
    example: '#D62828',
    description: 'Color hexadecimal usado para representar la ruta.',
  })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'color debe tener formato hexadecimal, por ejemplo #D62828',
  })
  color!: string;

  @ApiPropertyOptional({
    example: 5,
    default: 5,
    description: 'Frecuencia estimada en minutos.',
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  frecuenciaMin?: number;
}
