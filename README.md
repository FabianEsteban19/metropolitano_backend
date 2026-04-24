# Metropolitano Backend

Backend del sistema de monitoreo y gestion del Metropolitano del Peru, desarrollado con `NestJS`, `TypeORM` y `PostgreSQL`.

Este proyecto cubre la base operativa del dominio:

- rutas
- estaciones
- buses
- ruta_estaciones
- viajes
- viaje_estaciones
- reportes
- usuarios
- autenticacion con JWT

## Objetivo
Centralizar la informacion operativa para:

- administrar rutas, estaciones y buses
- registrar viajes reales
- registrar paso por estaciones
- almacenar reportes de posicion, velocidad y ocupacion
- exponer datos publicos para una landing sin login

## Stack
- `NestJS`
- `TypeORM`
- `PostgreSQL`
- `JWT`
- `class-validator`
- `Swagger`

## Ejecucion
```bash
npm install
npm run start:dev
```

## Variables principales
El proyecto usa `.env` para configuracion de base de datos y autenticacion.

Variables clave:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_SCHEMA`
- `DB_SSL`
- `DB_SSL_REJECT_UNAUTHORIZED`
- `JWT_SECRET`

## Accesos locales
- API: `http://localhost:3002`
- Swagger: `http://localhost:3002/api`

## Endpoints Publicos para Landing
Estos endpoints quedaron expuestos sin JWT para que el frontend publico pueda cargar informacion real:

- `GET /rutas`
- `GET /estaciones`
- `GET /ruta-estaciones/ruta/:rutaId`
- `GET /buses`
- `GET /reportes`

## Respuesta Estandar
Las respuestas exitosas siguen este formato:

```json
{
  "message": "Operacion exitosa",
  "data": {}
}
```

## Documentacion Funcional
La explicacion detallada de la arquitectura, modulos, autenticacion, flujo esperado de la solucion y uso de IA en la documentacion se encuentra en:

- [BACKEND_OVERVIEW.md](./BACKEND_OVERVIEW.md)

## Pruebas
```bash
npm run test
```

## Notas
- El proyecto usa `UUID` como identificador principal.
- Los modulos principales operan con `soft delete` mediante `isActive`.
- La autenticacion es global con JWT, salvo endpoints marcados como publicos.
- La documentacion tecnica fue redactada con apoyo de IA y validada dentro del contexto actual del proyecto.
