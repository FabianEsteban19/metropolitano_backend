import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { verifyPassword } from 'src/common/security/password.util';
import { CreateUsuarioDto } from 'src/usuario/dto/create-usuario.dto';
import { PublicUsuario, UsuarioService } from 'src/usuario/usuario.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usuarioService: UsuarioService,
        private readonly jwtService: JwtService,
    ) { }

    async register(
        createUsuarioDto: CreateUsuarioDto,
    ): Promise<BaseResponseDto<{ accessToken: string; user: PublicUsuario }>> {
        const usuarioCreado = await this.usuarioService.create(createUsuarioDto);
        const user = usuarioCreado.data;

        if (!user) {
            throw new BadRequestException('No se pudo crear el usuario');
        }

        const accessToken = this.generateAccessToken(user);

        return BaseResponseDto.success('Usuario registrado correctamente', {
            accessToken,
            user,
        });
    }

    async login(
        loginDto: LoginDto,
    ): Promise<BaseResponseDto<{ accessToken: string; user: PublicUsuario }>> {
        const email = loginDto.email.trim().toLowerCase();
        const usuario = await this.usuarioService.findByEmail(email);

        if (!usuario) {
            throw new UnauthorizedException('Credenciales invalidas');
        }

        const passwordValida = verifyPassword(
            loginDto.password,
            usuario.passwordHash,
        );

        if (!passwordValida) {
            throw new UnauthorizedException('Credenciales invalidas');
        }

        const user = this.usuarioService.toPublicUsuario(usuario);
        const accessToken = this.generateAccessToken(user);

        return BaseResponseDto.success('Inicio de sesion correcto', {
            accessToken,
            user,
        });
    }

    private generateAccessToken(user: PublicUsuario): string {
        return this.jwtService.sign({
            sub: user.id,
            email: user.email,
            rol: user.rol,
        });
    }
}
