import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEstacioneDto {
  @ApiProperty({
    example: 'Estacion Central',
    description: 'Nombre de la estacion.',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiProperty({
    example: 'Lima',
    description: 'Distrito donde se ubica la estacion.',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  distrito!: string;

  @ApiProperty({
    example: -12.046374,
    description: 'Latitud geografica de la estacion.',
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
    description: 'Longitud geografica de la estacion.',
    minimum: -180,
    maximum: 180,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-180)
  @Max(180)
  longitud!: number;

  @ApiProperty({
    example: 1,
    description: 'Orden de la estacion en la secuencia operativa.',
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  orden!: number;
}
