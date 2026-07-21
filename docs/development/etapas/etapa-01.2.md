# Etapa 1.2 - Autenticación (Login con JWT)

## Estado

✅ Completada

---

## Objetivo

Implementar el inicio de sesión de los usuarios mediante autenticación con JWT, permitiendo el acceso utilizando un único identificador (Email o DNI).

---

## Alcance

Se implementó:

- Módulo de autenticación.
- Endpoint `POST /auth/login`.
- DTO para la solicitud de login.
- Validación de credenciales mediante bcrypt.
- Generación de JWT.
- Respuesta con la información básica del usuario autenticado.

No se implementó:

- Registro de usuarios.
- Recuperación de contraseña.
- Guards.
- Autorización por roles.
- Refresh Token.
- Bloqueo por intentos fallidos.

Estas funcionalidades serán desarrolladas en etapas posteriores.

---

## Decisiones de arquitectura

### Identificador único

El login utiliza un único campo denominado `emailOrDni`.

El backend determina automáticamente si el valor corresponde a un correo electrónico o a un DNI.

Esto simplifica el frontend y evita mantener múltiples variantes del mismo endpoint.

---

### Contenido del JWT

El token contiene únicamente la información necesaria para identificar y autorizar al usuario.

Payload:

- `sub`
- `rol`

No se incluyen datos personales del usuario.

---

### Respuesta del endpoint

El endpoint devuelve:

- accessToken
- id
- nombre
- email
- rol

No se exponen datos innecesarios ni información sensible.

---

## Validaciones realizadas

### Compilación

- ✅ `npm run build`

### Pruebas técnicas

- Inicio correcto de NestJS.
- Registro del módulo de autenticación.
- Registro del endpoint `POST /auth/login`.

### Pruebas funcionales

Se verificó el login utilizando:

- Email.
- DNI.

En ambos casos se comprobó que:

- responde `200 OK`
- genera un JWT válido
- devuelve correctamente los datos del usuario
- no expone `passwordHash`

---

## Resultado

La autenticación básica mediante JWT quedó implementada y validada correctamente, estableciendo la base para incorporar posteriormente Guards, autorización por roles y el resto de las funcionalidades de seguridad.