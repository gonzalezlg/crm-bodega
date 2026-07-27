# Backlog Técnico

## Autenticación

- [ ] Incorporar @nestjs/config para gestionar variables de entorno.
- [ ] Eliminar el JWT_SECRET por defecto y exigir la variable de entorno.

## Seguridad

- [ ] Configurar expiración del JWT mediante variables de entorno.

BT-001 - Refactorizar Prisma a un único PrismaService
Prioridad: Media
Estado: Pendiente
Objetivo
Refactorizar la arquitectura del acceso a la base de datos para utilizar un único PrismaService inyectado mediante Dependency Injection de NestJS, eliminando la creación de múltiples instancias de PrismaClient.
Situación actual
Cada módulo crea su propia instancia:
private readonly prisma = new PrismaClient();
Actualmente ocurre en:
Auth
Clientes
Categorías
Productos
(y cualquier módulo nuevo que siga este patrón)
Objetivo final
Implementar:
PrismaModule
└── PrismaService
e inyectarlo mediante:
constructor(
  private readonly prisma: PrismaService,
) {}

BT-002

Refactorizar la capa HTTP del frontend.

Objetivo:

- centralizar autenticación
- centralizar fetch
- centralizar manejo de errores
- centralizar API_BASE_URL
- implementar cliente HTTP reutilizable

Alcance:

- api.js
- clientesService
- categoriasService
- productosService
- futuros servicios