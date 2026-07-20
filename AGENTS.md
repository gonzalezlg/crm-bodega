# CRM Bodega

## Objetivo del proyecto

Desarrollar un CRM web para centralizar la gestión operativa y administrativa de una bodega.

El MVP incluye:
- Dashboard administrativo.
- Reservas para restaurante y degustaciones.
- Gestión de clientes.
- Gestión de productos y vinos.
- Control de stock mediante movimientos.
- Registro de gastos.
- Registro de ingresos.
- Gestión básica de usuarios.

## Fuente de verdad

Toda decisión funcional, técnica y de alcance debe respetar: `docs/planificacion-crm-bodega.md`

Antes de implementar una tarea, revisar la sección correspondiente de ese documento.

En caso de contradicción entre el código y la documentación:
1. No asumir automáticamente que el código es correcto.
2. Informar la contradicción.
3. Solicitar confirmación antes de modificar la arquitectura o las reglas de negocio.

## Stack tecnológico

### Frontend
- React.
- Vite.
- TypeScript.
- React Router.
- Tailwind CSS. (los estilos podemos tomarlos desde la imagen que se encuentra en la carpeta img-diseño/image.png)

### Backend
- NestJS.
- TypeScript.
- Prisma ORM.
- API REST.
- Validación mediante DTOs y `class-validator`.

### Base de datos
- PostgreSQL.
- Prisma como única capa de acceso a datos.
- Migraciones versionadas con Prisma.

### Infraestructura
- Supabase se utiliza únicamente como proveedor gestionado de PostgreSQL.
- La conexión se realiza mediante la variable de entorno `DATABASE_URL`.

## Arquitectura
- El frontend se comunica únicamente con la API REST de NestJS.
- El frontend no debe conectarse directamente a Supabase.
- NestJS contiene la lógica de negocio, validaciones y autorización.
- Prisma es la única capa que accede a PostgreSQL.
- Supabase se utiliza solamente para alojar la base de datos.
- No utilizar Supabase Auth.
- No utilizar Supabase Storage.
- No utilizar Supabase Edge Functions.
- No utilizar Row Level Security como reemplazo de la autorización del backend.
- No implementar microservicios.
- Mantener una arquitectura modular y simple.

## Estructura general

```text
crm-bodega/
├── AGENTS.md
├── README.md
├── .gitignore
├── docs/
│   └── planificacion-crm-bodega.md
├── 02-frontend/
└── 01-backend/