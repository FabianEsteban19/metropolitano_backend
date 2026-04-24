import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuarios } from './entities/Usuarios';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { hashPassword } from 'src/common/security/password.util';

export type PublicUsuario = Omit<Usuarios, 'passwordHash'>;

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuarios)
    private readonly usuarioRepository: Repository<Usuarios>,
  ) { }

  async create(
    createUsuarioDto: CreateUsuarioDto,
  ): Promise<BaseResponseDto<PublicUsuario>> {
    try {
      const email = createUsuarioDto.email.trim().toLowerCase();
      await this.ensureEmailAvailable(email);

      const usuario = this.usuarioRepository.create({
        email,
        passwordHash: hashPassword(createUsuarioDto.password),
        nombre: createUsuarioDto.nombre?.trim() || null,
        rol: createUsuarioDto.rol ?? 'operador',
      });

      const usuarioGuardado = await this.usuarioRepository.save(usuario);

      return BaseResponseDto.success(
        'Usuario creado correctamente',
        this.toPublicUsuario(usuarioGuardado),
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al crear el usuario');
    }
  }

  async findAll(): Promise<BaseResponseDto<PublicUsuario[]>> {
    try {
      const usuarios = await this.usuarioRepository.find({
        order: { createdAt: 'DESC' },
      });

      return BaseResponseDto.success(
        usuarios.length > 0
          ? 'Usuarios encontrados correctamente'
          : 'No hay usuarios registrados',
        usuarios.map((usuario) => this.toPublicUsuario(usuario)),
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al obtener los usuarios');
    }
  }

  async findOne(id: string): Promise<BaseResponseDto<PublicUsuario>> {
    try {
      this.validateId(id);

      const usuario = await this.findUsuarioEntityOrFail(id);

      return BaseResponseDto.success(
        'Usuario encontrado correctamente',
        this.toPublicUsuario(usuario),
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al obtener el usuario');
    }
  }

  async findByEmail(email: string): Promise<Usuarios | null> {
    return this.usuarioRepository.findOne({
      where: { email: email.trim().toLowerCase() },
    });
  }

  async update(
    id: string,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<BaseResponseDto<PublicUsuario>> {
    try {
      this.validateId(id);

      if (Object.keys(updateUsuarioDto).length === 0) {
        throw new BadRequestException(
          'Debes enviar al menos un campo para actualizar',
        );
      }

      const usuario = await this.findUsuarioEntityOrFail(id);

      if (
        updateUsuarioDto.email !== undefined &&
        updateUsuarioDto.email.trim().toLowerCase() !== usuario.email
      ) {
        await this.ensureEmailAvailable(
          updateUsuarioDto.email.trim().toLowerCase(),
          usuario.id,
        );
        usuario.email = updateUsuarioDto.email.trim().toLowerCase();
      }

      if (updateUsuarioDto.password !== undefined) {
        usuario.passwordHash = hashPassword(updateUsuarioDto.password);
      }

      if (updateUsuarioDto.nombre !== undefined) {
        usuario.nombre = updateUsuarioDto.nombre?.trim() || null;
      }

      if (updateUsuarioDto.rol !== undefined) {
        usuario.rol = updateUsuarioDto.rol;
      }

      const usuarioActualizado = await this.usuarioRepository.save(usuario);

      return BaseResponseDto.confirmation(
        'Usuario actualizado correctamente',
        this.toPublicUsuario(usuarioActualizado),
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al actualizar el usuario');
    }
  }

  async remove(id: string): Promise<BaseResponseDto<PublicUsuario>> {
    try {
      this.validateId(id);

      const usuario = await this.findUsuarioEntityOrFail(id);
      const usuarioEliminado = this.toPublicUsuario(usuario);

      await this.usuarioRepository.remove(usuario);

      return BaseResponseDto.confirmation(
        'Usuario eliminado correctamente',
        usuarioEliminado,
      );
    } catch (error) {
      this.handleUnexpectedError(error, 'Error al eliminar el usuario');
    }
  }

  public toPublicUsuario(usuario: Usuarios): PublicUsuario {
    const { passwordHash, ...publicUsuario } = usuario;
    return publicUsuario;
  }

  private async ensureEmailAvailable(
    email: string,
    excludeId?: string,
  ): Promise<void> {
    const usuarioExistente = await this.findByEmail(email);

    if (usuarioExistente && usuarioExistente.id !== excludeId) {
      throw new ConflictException(`Ya existe un usuario con el email ${email}`);
    }
  }

  private async findUsuarioEntityOrFail(id: string): Promise<Usuarios> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`No se encontro el usuario con id ${id}`);
    }

    return usuario;
  }

  private validateId(id: string): void {
    if (!id?.trim() || !isUUID(id)) {
      throw new BadRequestException('El id debe ser un UUID valido');
    }
  }

  private handleUnexpectedError(error: unknown, message: string): never {
    if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException(message);
  }
}
