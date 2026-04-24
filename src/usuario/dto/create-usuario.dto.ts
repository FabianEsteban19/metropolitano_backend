import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum UsuarioRol {
  ADMIN = 'admin',
  OPERADOR = 'operador',
  SUPERVISOR = 'supervisor',
}

export class CreateUsuarioDto {
  @ApiProperty({
    example: 'operador@metropolitano.pe',
    description: 'Correo unico del usuario.',
    maxLength: 120,
  })
  @IsEmail()
  @MaxLength(120)
  email!: string;

  @ApiProperty({
    example: '$2b$10$abcdefghijklmnopqrstuv',
    description:
      'Hash de la contrasena. Si luego implementas autenticacion, conviene recibir password plano y hashearlo en el service.',
  })
  @IsString()
  @IsNotEmpty()
  passwordHash!: string;

  @ApiPropertyOptional({
    example: 'Ana Flores',
    description: 'Nombre visible del usuario.',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({
    enum: UsuarioRol,
    enumName: 'UsuarioRol',
    example: UsuarioRol.OPERADOR,
    default: UsuarioRol.OPERADOR,
    description: 'Rol del usuario dentro del sistema.',
  })
  @IsOptional()
  @IsEnum(UsuarioRol)
  rol?: UsuarioRol;
}
