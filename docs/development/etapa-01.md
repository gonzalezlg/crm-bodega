# Etapa 1 - Modelo inicial de autenticación

## Estado

✅ Finalizada

---

## Objetivo

Construir la estructura de persistencia necesaria para la autenticación del sistema.

En esta etapa únicamente se implementó el modelo de datos. No se desarrolló el login ni la autorización.

---

## ¿Por qué era necesaria esta etapa?

Antes de autenticar usuarios era necesario definir cómo serían almacenados en la base de datos y cuáles serían sus roles.

Esta decisión permitirá construir posteriormente el módulo de autenticación sin necesidad de modificar la estructura de datos.

---

## Conceptos aprendidos

- Prisma ORM
- Migraciones
- Seed
- PostgreSQL
- Supabase
- DATABASE_URL
- bcrypt
- UUID
- Restricciones UNIQUE

---

## Archivos creados

- prisma/seed.ts
- prisma/migrations/20260720165000_init_auth_models/

---

## Archivos modificados

- prisma/schema.prisma
- package.json
- package-lock.json

---

## Validaciones realizadas

### Infraestructura

- ✅ Prisma validate
- ✅ Conexión con Supabase
- ✅ DATABASE_URL configurado

### Base de datos

- ✅ Migración aplicada
- ✅ Prisma Client generado
- ✅ Base sincronizada

### Datos

- ✅ Seed ejecutado
- ✅ Roles creados
- ✅ Usuario administrador creado
- ✅ Contraseña almacenada con bcrypt
- ✅ Seed idempotente

### Backend

- ✅ npm run build
- ✅ GET /health

---

## Decisiones de arquitectura
- Usuario.id utiliza UUID.
- El DNI es único pero no es la clave primaria.
- El email también es único.
- Las contraseñas nunca se almacenan en texto plano.
- La base de datos utilizada es PostgreSQL en Supabase.
---
## Problemas encontrados

### Error P1001
Prisma no podía conectarse a PostgreSQL porque se utilizaba una conexión incompatible con la red local.
Se solucionó utilizando Session Pooler de Supabase durante el desarrollo.
---

## Commit: feat(auth): crear modelo inicial de usuarios y roles
---
## Próxima etapa
Implementar el módulo de autenticación (login con JWT).