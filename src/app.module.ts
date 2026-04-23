import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BusesModule } from './buses/buses.module';
import { EstacionesModule } from './estaciones/estaciones.module';
import { ReportesModule } from './reportes/reportes.module';
import { RutaEstacionesModule } from './ruta_estaciones/ruta_estaciones.module';
import { RutasModule } from './rutas/rutas.module';
import { UsuarioModule } from './usuario/usuario.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
    isGlobal: true,
  }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      schema: process.env.DB_SCHEMA,
      // SSL es requerido por Supabase. Controlado vía env.
      ssl: process.env.DB_SSL === 'true',
      extra:
        process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false'
          ? { ssl: { rejectUnauthorized: false } }
          : undefined,
      entities: [__dirname + '/**/entities/*{.ts,.js}'],
      synchronize: false, // Crea las tablas automáticamente - SOLO para desarrollo
    }), BusesModule, EstacionesModule, ReportesModule, RutaEstacionesModule, RutasModule, UsuarioModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
