# Metropolitano Backend Overview

## Descripcion General
Este proyecto es el backend del sistema de monitoreo y gestion del Metropolitano del Peru. Fue construido con `NestJS`, `TypeORM` y `PostgreSQL`, y modela la operacion principal del sistema: rutas, estaciones, buses, viajes, paso por estaciones, reportes operativos y autenticacion.

La solucion busca cubrir dos frentes:

- Operacion interna: administracion de rutas, buses, estaciones, viajes y reportes.
- Consumo publico: una landing que puede mostrar rutas, estaciones, buses y estado operativo sin requerir login.

## Objetivo del Backend
El backend centraliza la informacion operativa para responder preguntas como:

- Que rutas existen y que estaciones recorre cada una.
- Que buses estan activos y en que estado operativo se encuentran.
- Que viaje esta realizando un bus en una fecha determinada.
- En que estacion va un viaje y si va a tiempo o con retraso.
- Que reportes de posicion, ocupacion y velocidad se estan recibiendo.

## Arquitectura Aplicada
La aplicacion sigue la estructura modular de NestJS:

- `controller`: expone endpoints HTTP.
- `service`: concentra la logica de negocio.
- `dto`: valida datos de entrada.
- `entities`: mapea tablas de base de datos con TypeORM.
- `module`: agrupa y registra dependencias del modulo.

Adicionalmente, el proyecto usa:

- `UUID` como identificador principal en las entidades.
- `isActive` para borrado logico en los modulos principales.
- `BaseResponseDto` para estandarizar respuestas exitosas con `message` y `data`.
- `ValidationPipe` global para validar y transformar requests.
- `JWT` con guard global para proteger el backend.

## Modulos Principales
### `rutas`
Administra las rutas del sistema. Define codigo, nombre, tipo de servicio, color y frecuencia estimada.

### `estaciones`
Representa estaciones del recorrido con nombre, distrito, coordenadas y orden operativo.

### `buses`
Gestiona los buses, su capacidad, placa, ruta asignada y estado operativo.

### `ruta_estaciones`
Relaciona una ruta con sus estaciones. Es clave para reconstruir el recorrido de una ruta y para validar si un reporte corresponde a una estacion de la ruta del bus.

### `viajes`
Representa una corrida operativa real de un bus en una ruta, con horas programadas y reales.

### `viaje_estaciones`
Permite registrar el comportamiento de un viaje en cada estacion: llegada, salida y cumplimiento.

### `reportes`
Registra la posicion reportada del bus, cantidad de pasajeros, velocidad y estacion asociada si aplica.

### `auth`
Maneja registro, login y proteccion de endpoints con JWT.

### `usuario`
Gestiona usuarios del sistema, hash de password y roles.

## Autenticacion
La autenticacion actual es basica, pero funcional:

- `POST /auth/register`: crea usuario y devuelve `accessToken`.
- `POST /auth/login`: valida credenciales y devuelve `accessToken`.
- El proyecto usa `JwtAuthGuard` global, por lo que por defecto las rutas quedan protegidas.
- Algunas rutas `GET` se marcaron con `@Public()` para soportar la landing publica sin login.

## Endpoints Publicos para la Landing
Estos endpoints pueden consumirse sin JWT:

- `GET /rutas`
- `GET /estaciones`
- `GET /ruta-estaciones/ruta/:rutaId`
- `GET /buses`
- `GET /reportes`

Su objetivo es permitir que el frontend publico muestre:

- rutas disponibles
- estaciones del sistema
- secuencia de estaciones por ruta
- buses visibles en operacion
- datos de seguimiento y ocupacion para la seccion "en vivo"

## Respuesta Estandar
Las respuestas exitosas siguen este formato:

```json
{
  "message": "Operacion exitosa",
  "data": {}
}
```

Esto facilita la integracion con frontend y mantiene una estructura consistente.

## Resumen de Endpoints y su Aporte a la Solucion
### Auth
- `POST /auth/register`
  Sirve para registrar usuarios del panel interno.
- `POST /auth/login`
  Sirve para autenticar operadores, supervisores o administradores.

### Rutas
- `GET /rutas`
  Permite listar rutas activas para la landing y para paneles internos.
- `GET /rutas/codigo/:codigo`
  Permite buscar una ruta especifica por su codigo operativo.
- `GET /rutas/:id`
  Permite consultar el detalle de una ruta puntual.
- `POST /rutas`
  Permite registrar una nueva ruta.
- `PATCH /rutas/:id`
  Permite actualizar datos de una ruta.
- `DELETE /rutas/:id`
  Desactiva una ruta por borrado logico.
- `PATCH /rutas/:id/restore`
  Reactiva una ruta previamente desactivada.

### Estaciones
- `GET /estaciones`
  Permite mostrar el mapa o listado general de estaciones activas.
- `GET /estaciones/:id`
  Consulta una estacion puntual.
- `POST /estaciones`
  Registra una nueva estacion.
- `PATCH /estaciones/:id`
  Actualiza una estacion.
- `DELETE /estaciones/:id`
  Desactiva una estacion.
- `PATCH /estaciones/:id/restore`
  Reactiva una estacion.

### Buses
- `GET /buses`
  Permite mostrar buses activos en la operacion y en la landing.
- `GET /buses/:id`
  Consulta detalle de un bus.
- `POST /buses`
  Registra un bus nuevo.
- `PATCH /buses/:id`
  Actualiza su informacion o estado.
- `DELETE /buses/:id`
  Desactiva un bus.
- `PATCH /buses/:id/restore`
  Reactiva un bus.

### Ruta-Estaciones
- `GET /ruta-estaciones`
  Lista todas las relaciones activas entre rutas y estaciones.
- `GET /ruta-estaciones/ruta/:rutaId`
  Permite reconstruir el recorrido de una ruta especifica.
- `GET /ruta-estaciones/:rutaId/:estacionId`
  Consulta una relacion puntual entre ruta y estacion.
- `POST /ruta-estaciones`
  Crea una relacion individual ruta-estacion.
- `POST /ruta-estaciones/lote`
  Registra varias estaciones para una ruta dentro de una transaccion.
- `PATCH /ruta-estaciones/:rutaId/:estacionId`
  Actualiza una relacion existente.
- `DELETE /ruta-estaciones/:rutaId/:estacionId`
  Desactiva la relacion.
- `PATCH /ruta-estaciones/:rutaId/:estacionId/restore`
  Restaura la relacion.

### Viajes
- `GET /viajes`
  Lista viajes activos programados o en ejecucion.
- `GET /viajes/:id`
  Consulta un viaje concreto.
- `POST /viajes`
  Registra una corrida operativa real.
- `PATCH /viajes/:id`
  Ajusta horas, estado o datos del viaje.
- `DELETE /viajes/:id`
  Desactiva un viaje.
- `PATCH /viajes/:id/restore`
  Reactiva un viaje.

### Viaje-Estaciones
- `GET /viaje-estaciones`
  Lista paradas operativas registradas de los viajes.
- `GET /viaje-estaciones/:id`
  Consulta una parada operativa puntual.
- `POST /viaje-estaciones`
  Registra una parada de un viaje.
- `PATCH /viaje-estaciones/:id`
  Actualiza tiempos o estado de cumplimiento.
- `DELETE /viaje-estaciones/:id`
  Desactiva la parada operativa.
- `PATCH /viaje-estaciones/:id/restore`
  Restaura la parada operativa.

### Reportes
- `GET /reportes`
  Permite recuperar reportes activos para vistas de monitoreo y landing publica.
- `GET /reportes/:id`
  Consulta un reporte puntual.
- `POST /reportes`
  Registra posicion, pasajeros, velocidad y estacion asociada de un bus.
- `PATCH /reportes/:id`
  Permite corregir o ajustar un reporte.
- `DELETE /reportes/:id`
  Desactiva un reporte.
- `PATCH /reportes/:id/restore`
  Reactiva un reporte.

### Usuarios
- `GET /usuarios`
  Lista usuarios del sistema interno.
- `GET /usuarios/:id`
  Consulta un usuario puntual.
- `POST /usuarios`
  Crea usuario directamente desde modulo usuario.
- `PATCH /usuarios/:id`
  Actualiza usuario.
- `DELETE /usuarios/:id`
  Elimina usuario.

## Flujo Esperado de la Solucion
### Landing publica
Consume:

- `GET /rutas`
- `GET /estaciones`
- `GET /ruta-estaciones/ruta/:rutaId`
- `GET /buses`
- `GET /reportes`

Con eso puede mostrar el sistema, recorridos y una vista basica de seguimiento.

### Panel interno
Consume endpoints protegidos para:

- registrar rutas, estaciones y buses
- crear viajes operativos
- registrar paso por estaciones
- registrar reportes de posicion y ocupacion

### Seguimiento en vivo
El flujo pensado actualmente es:

1. Un cliente envía posicion al backend usando `POST /reportes`.
2. El backend guarda el reporte y valida que la estacion pertenezca a la ruta del bus cuando corresponda.
3. El frontend reconstruye el estado del bus consumiendo `GET /reportes`, `GET /buses` y `GET /ruta-estaciones/ruta/:rutaId`.

## Estado Actual del Proyecto
El proyecto ya cubre la base principal del dominio:

- CRUD y soft delete en modulos operativos principales.
- autenticacion con JWT.
- endpoints publicos para landing.
- soporte para viajes y reportes operativos.
- soporte transaccional en `ruta_estaciones`.

Todavia hay espacio para evolucionar hacia:

- ETA real por estacion
- WebSocket o SSE para tiempo real real
- roles y permisos mas finos
- automatizacion de llegada a estacion por geolocalizacion

## Uso de IA en Este Documento
Este documento fue elaborado con apoyo de inteligencia artificial como asistencia de redaccion tecnica y organizacion del contenido. La IA se utilizo para:

- estructurar el resumen funcional del backend
- sintetizar el proposito de cada modulo y endpoint
- redactar este documento en formato Markdown

El contenido fue orientado al estado actual del proyecto y debe ser revisado por el autor del sistema antes de usarse como documentacion final de entrega o produccion.

## Referencias Rapidas
- Puerto local esperado: `3002`
- Swagger: `http://localhost:3002/api`
- ORM: `TypeORM`
- Base de datos: `PostgreSQL`
- Framework: `NestJS`
