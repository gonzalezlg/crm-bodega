# Etapa 1.3 - Autorización con JWT y Roles

## Objetivo

Implementar la infraestructura de autenticación y autorización del backend mediante JWT y roles, dejando protegida toda la API por defecto.

A partir de esta etapa, cualquier endpoint requerirá un JWT válido para ser consumido, salvo aquellos que sean marcados explícitamente como públicos mediante el decorador `@Public()`.

Además, se incorporó un sistema de autorización basado en roles que permitirá restringir el acceso a determinados recursos según el perfil del usuario autenticado.

Esta infraestructura servirá como base para todas las funcionalidades futuras del CRM.

---

# Conceptos y decisiones de arquitectura

## Autenticación vs Autorización

Aunque ambos conceptos trabajan juntos, resuelven problemas completamente distintos.

### Autenticación

La autenticación responde una única pregunta:

> **¿Quién es el usuario?**

En esta etapa la autenticación se implementó mediante JWT (JSON Web Token).

Cuando un usuario inicia sesión correctamente, el backend genera un token firmado digitalmente.

En las siguientes peticiones el cliente deberá enviar dicho token mediante el encabezado:

```http
Authorization: Bearer <JWT>
```

Si el token es válido, el usuario queda autenticado.

Si el token:

- no existe,
- fue modificado,
- posee una firma inválida,
- o se encuentra vencido,

la API responderá:

```text
401 Unauthorized
```

---

### Autorización

Una vez autenticado el usuario todavía queda una pregunta por responder.

> **¿Tiene permiso para realizar esta acción?**

Para resolver este problema se incorporó un sistema basado en roles.

Cada endpoint podrá indicar qué roles tienen permitido acceder utilizando el decorador:

```ts
@Roles('OWNER')
```

Si el usuario posee un JWT válido pero no tiene el rol requerido, la API responderá:

```text
403 Forbidden
```

De esta manera se separan claramente los conceptos de identidad y permisos.

---

# Endpoints públicos y privados

A partir de esta etapa toda la API queda protegida por defecto.

Esto significa que cualquier endpoint requerirá autenticación salvo que se indique explícitamente lo contrario.

Los endpoints públicos se definen utilizando:

```ts
@Public()
```

Actualmente el único endpoint público del sistema es:

```text
POST /auth/login
```

Esto es necesario porque un usuario todavía no dispone de un JWT antes de autenticarse.

Todos los demás endpoints requieren un token válido.

---

# ¿Por qué proteger toda la API por defecto?

Se decidió invertir la lógica habitual.

En lugar de recordar proteger manualmente cada endpoint mediante guards, todos los endpoints quedan protegidos automáticamente.

Únicamente aquellos recursos que realmente deban ser públicos deberán declararlo mediante:

```ts
@Public()
```

Esta estrategia reduce significativamente el riesgo de dejar accidentalmente expuesto un endpoint por olvidar agregar un guard.

Es una práctica ampliamente utilizada en aplicaciones profesionales.

---

# Separación de responsabilidades

La infraestructura se diseñó siguiendo el principio de responsabilidad única.

Cada componente tiene una única función dentro del sistema.

---

## JwtStrategy

La estrategia JWT tiene como única responsabilidad validar el token recibido.

Su funcionamiento consiste en:

- Extraer el JWT desde el header Authorization.
- Validar la firma.
- Verificar la expiración.
- Leer el payload.
- Incorporar el usuario autenticado en `request.user`.

No contiene reglas de negocio.

No consulta la base de datos.

No valida permisos.

---

## AuthGuard

El AuthGuard únicamente responde la siguiente pregunta:

> ¿Este endpoint requiere autenticación?

Su funcionamiento es:

1. Verificar si el endpoint posee el decorador `@Public()`.
2. Si el endpoint es público, permitir el acceso inmediatamente.
3. Si el endpoint no es público, delegar la validación del JWT a Passport y a `JwtStrategy`.

El AuthGuard nunca verifica roles.

Su única responsabilidad consiste en decidir si la autenticación debe ejecutarse o no.

---

## RolesGuard

El RolesGuard se ejecuta únicamente cuando el usuario ya fue autenticado.

Su única responsabilidad consiste en verificar si el usuario posee alguno de los roles permitidos para el endpoint solicitado.

No valida el JWT.

No consulta la base de datos.

Únicamente compara:

```text
Roles permitidos
vs
request.user.rol
```

Cuando el usuario no posee los permisos necesarios responde:

```text
403 Forbidden
```

---

# Uso de metadata

Los decoradores personalizados implementados durante esta etapa no contienen lógica de negocio.

Su única función consiste en agregar metadata sobre los endpoints.

Para ello se utiliza:

```ts
SetMetadata(...)
```

Posteriormente los guards recuperan esa información mediante:

```ts
Reflector
```

Gracias a esta estrategia los controladores permanecen completamente desacoplados del sistema de seguridad.

---

# Arquitectura implementada

El flujo de una petición protegida quedó definido de la siguiente forma:

```text
Cliente
    │
    │ Authorization: Bearer <JWT>
    ▼
AuthGuard
    │
    │ ¿Es un endpoint público?
    │
    ├──────────────► Sí
    │                 │
    │                 ▼
    │            Controller
    │
    ▼
JwtStrategy
    │
    │ Valida JWT
    │
    ▼
request.user
    │
    ▼
RolesGuard
    │
    ├──────────────► Rol permitido
    │                 │
    │                 ▼
    │            Controller
    │
    └──────────────► Rol incorrecto
                      │
                      ▼
                403 Forbidden
```

Esta arquitectura permite mantener completamente separadas la autenticación y la autorización.

---

# Guards globales

Los guards fueron registrados mediante `APP_GUARD`.

Esto permite que NestJS los ejecute automáticamente para todos los endpoints de la aplicación.

Como consecuencia, no es necesario utilizar:

```ts
@UseGuards(...)
```

en cada controlador.

Toda la seguridad queda centralizada en un único lugar.

---

# Orden de ejecución

Los guards fueron registrados en el siguiente orden:

1. AuthGuard
2. RolesGuard

Este orden resulta fundamental.

Primero debe autenticarse el usuario.

Recién después es posible comprobar si posee los permisos necesarios.

Si el orden fuera inverso, el RolesGuard intentaría acceder a `request.user` antes de que el JWT hubiera sido validado.

---

# Beneficios de la arquitectura

La solución implementada aporta las siguientes ventajas:

- Toda la API queda protegida por defecto.
- Los endpoints públicos son explícitos.
- La autenticación y la autorización permanecen desacopladas.
- Los controladores no contienen lógica de seguridad.
- Los guards son reutilizables.
- Resulta sencillo incorporar nuevos roles.
- La arquitectura es escalable.
- Se encuentra alineada con las buenas prácticas recomendadas por NestJS.

---

# Alcance implementado

Durante esta etapa se incorporó la infraestructura necesaria para proteger la API mediante JWT y autorización por roles.

Se implementaron los siguientes componentes:

- JWT Strategy.
- Auth Guard global.
- Roles Guard global.
- Decorador `@Public()`.
- Decorador `@Roles()`.
- Protección global de la API.
- Login público.
- Endpoint protegido mediante rol.

No se realizaron modificaciones sobre el esquema de Prisma ni se agregaron nuevos endpoints.

---

# JWT Strategy

Se creó la estrategia:

```text
src/auth/strategies/jwt.strategy.ts
```

Su responsabilidad consiste exclusivamente en validar el JWT recibido.

La estrategia:

- Extrae el token desde el header `Authorization`.
- Utiliza el esquema `Bearer`.
- Valida la firma.
- Verifica que el token no se encuentre vencido.
- Lee el payload.
- Incorpora el usuario autenticado dentro de `request.user`.

No consulta la base de datos.

No contiene reglas de negocio.

El payload esperado es:

```ts
{
  sub: string;
  rol: string;
}
```

Luego de validar el token se incorpora en la request:

```ts
{
  id: payload.sub,
  rol: payload.rol
}
```

---

# Decorador @Public()

Se creó el decorador:

```text
src/auth/decorators/public.decorator.ts
```

Su función consiste únicamente en agregar metadata indicando que un endpoint puede ser consumido sin autenticación.

Actualmente se utiliza sobre:

```text
POST /auth/login
```

permitiendo iniciar sesión sin disponer previamente de un JWT.

---

# Decorador @Roles()

Se creó el decorador:

```text
src/auth/decorators/roles.decorator.ts
```

Permite indicar qué roles pueden acceder a un determinado endpoint.

Ejemplo:

```ts
@Roles('OWNER')
```

Actualmente los roles tipados son:

```ts
type Role = 'OWNER' | 'EMPLOYEE'
```

En una etapa futura este tipo podrá reemplazarse por un enum o tipo compartido proveniente de Prisma para establecer un único origen de verdad.

---

# Auth Guard

Se creó:

```text
src/auth/guards/auth.guard.ts
```

Su responsabilidad consiste únicamente en determinar si el endpoint requiere autenticación.

El flujo implementado es:

1. Consultar si el endpoint posee `@Public()`.
2. Si el endpoint es público, permitir el acceso.
3. Si no es público, delegar la validación del JWT a Passport.

No verifica permisos.

No valida roles.

---

# Roles Guard

Se creó:

```text
src/auth/guards/roles.guard.ts
```

Su responsabilidad consiste exclusivamente en validar los permisos del usuario autenticado.

Su funcionamiento es:

1. Leer los roles definidos mediante `@Roles()`.
2. Permitir el acceso cuando el endpoint no define restricciones.
3. Obtener el usuario autenticado desde `request.user`.
4. Comparar el rol del usuario con los roles permitidos.
5. Responder `403 Forbidden` cuando el usuario no posea permisos suficientes.

---

# Endpoint protegido

Se reutilizó el endpoint existente:

```text
GET /health
```

El endpoint quedó protegido mediante:

```ts
@Roles('OWNER')
```

Esto implica que:

- requiere un JWT válido;
- requiere el rol `OWNER`.

No fue necesario crear endpoints temporales de prueba.

---

# Archivos creados

```text
src/auth/strategies/jwt.strategy.ts
src/auth/decorators/public.decorator.ts
src/auth/decorators/roles.decorator.ts
src/auth/guards/auth.guard.ts
src/auth/guards/roles.guard.ts
```

---

# Archivos modificados

```text
src/auth/auth.module.ts
src/auth/auth.controller.ts
src/app.module.ts
src/app.controller.ts
package.json
package-lock.json
```

---

# Dependencias incorporadas

Se incorporaron las siguientes dependencias para utilizar Passport junto con JWT:

```text
@nestjs/passport
passport
passport-jwt
@types/passport-jwt
```

---

# Pruebas realizadas

## Login sin token

```text
POST /auth/login
```

Resultado esperado:

```text
200 OK
```

Resultado obtenido:

✅ Correcto.

---

## Endpoint protegido sin token

```text
GET /health
```

Resultado esperado:

```text
401 Unauthorized
```

Resultado obtenido:

✅ Correcto.

---

## Endpoint protegido con JWT válido

```text
GET /health
Authorization: Bearer <token válido>
```

Resultado esperado:

```text
200 OK
```

Respuesta:

```json
{
    "status": "ok"
}
```

Resultado obtenido:

✅ Correcto.

---

## Endpoint protegido con JWT inválido

```text
GET /health
Authorization: Bearer token-invalido
```

Resultado esperado:

```text
401 Unauthorized
```

Resultado obtenido:

✅ Correcto.

---

## Endpoint protegido con rol incorrecto

Se generó un JWT firmado utilizando el mismo secreto del proyecto pero con el rol:

```text
EMPLOYEE
```

Resultado esperado:

```text
403 Forbidden
```

Resultado obtenido:

✅ Correcto.

La prueba se realizó sin modificar usuarios, datos ni el esquema de Prisma.

---

# Validación técnica

Se ejecutó:

```bash
npm run build
```

Resultado:

```text
Compilación exitosa.
```

No se detectaron errores de compilación.

---

# Decisiones de arquitectura tomadas

Durante esta etapa se definieron las siguientes decisiones:

- Proteger toda la API por defecto.
- Declarar explícitamente los endpoints públicos mediante `@Public()`.
- Separar autenticación y autorización en componentes independientes.
- Registrar los guards globalmente mediante `APP_GUARD`.
- Ejecutar primero `AuthGuard` y luego `RolesGuard`.
- No consultar la base de datos desde `JwtStrategy`.
- Reutilizar el endpoint `GET /health` como recurso protegido.
- Mantener temporalmente el secreto JWT actual hasta incorporar `@nestjs/config`.
- Mantener la implementación preparada para incorporar nuevos roles sin modificar la infraestructura.

---

# Fuera de alcance

Durante esta etapa no se implementaron:

- Refresh Tokens.
- Logout.
- Registro de usuarios.
- Recuperación de contraseña.
- Bloqueo por intentos fallidos.
- Sesiones.
- Permisos por módulo.
- Múltiples roles por usuario.
- ACL.
- CASL.
- Policies.
- Cambios sobre Prisma.
- Cambios en el frontend.

Estas funcionalidades serán abordadas en etapas posteriores del proyecto.

---

# Aprendizajes

Durante esta etapa se incorporaron los siguientes conceptos:

- Diferencia entre autenticación y autorización.
- Funcionamiento de JWT.
- Estrategia JWT mediante Passport.
- Guards globales.
- Decoradores personalizados.
- Metadata mediante `SetMetadata`.
- Uso de `Reflector`.
- Diferencia entre `401 Unauthorized` y `403 Forbidden`.
- Protección global de una API.
- Separación de responsabilidades.
- Registro de providers mediante `APP_GUARD`.
- Arquitectura escalable para autenticación y autorización.