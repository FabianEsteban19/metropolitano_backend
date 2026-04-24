import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T = unknown> {
  @ApiProperty({
    example: 'Operacion exitosa',
    description: 'Mensaje descriptivo del resultado de la operacion.',
  })
  message!: string;

  @ApiProperty({
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      codigo: 'A',
      nombre: 'Ruta A',
    },
    description:
      'Cuerpo de la respuesta. Puede ser un objeto, un arreglo o null.',
    nullable: true,
    type: 'object',
    additionalProperties: true,
  })
  data!: T | null;

  constructor(message: string, data: T | null = null) {
    this.message = message;
    this.data = data;
  }

  static success<T>(
    message = 'Operacion exitosa',
    data: T | null = null,
  ): BaseResponseDto<T> {
    return new BaseResponseDto<T>(message, data);
  }

  static error<T = unknown>(
    message = 'Ocurrio un error',
    data: T | null = null,
  ): BaseResponseDto<T> {
    return new BaseResponseDto<T>(message, data);
  }

  static confirmation<T>(
    message = 'Operacion confirmada',
    data: T | null = null,
  ): BaseResponseDto<T> {
    return new BaseResponseDto<T>(message, data);
  }
}
