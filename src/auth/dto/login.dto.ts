import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        example: 'operador@metropolitano.pe',
        description: 'Correo del usuario.',
    })
    @IsEmail()
    email!: string;

    @ApiProperty({
        example: 'MiClaveSegura123',
        description: 'Contrasena del usuario.',
    })
    @IsString()
    @IsNotEmpty()
    password!: string;
}