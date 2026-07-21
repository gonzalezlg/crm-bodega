# Etapa 1.4 - Infraestructura de Autenticación del Frontend
commit -m "feat(frontend): implement authentication infrastructure"

## Objetivo

Implementar la infraestructura base de autenticación del frontend para permitir que un usuario pueda iniciar sesión, mantener la sesión activa entre recargas del navegador, cerrar sesión y acceder únicamente a las rutas protegidas del sistema.

En esta etapa no se implementó ninguna funcionalidad del negocio. El objetivo fue construir la base sobre la cual se desarrollarán los módulos del CRM.

---

# Conceptos

Durante esta etapa se implementaron los siguientes conceptos:

- React Context para administrar el estado global de autenticación.
- Hook personalizado (`useAuth`) para acceder al contexto.
- Persistencia de sesión mediante `localStorage`.
- Protección de rutas mediante React Router.
- Separación entre lógica de negocio y comunicación HTTP.
- Centralización de las llamadas al backend.

---

# Decisiones de arquitectura

Se definieron las siguientes decisiones:

## AuthContext como única fuente de verdad

Toda la información relacionada con la autenticación es administrada exclusivamente por `AuthContext`.

Ningún componente de la aplicación debe acceder directamente a `localStorage`.

Toda consulta sobre el estado de autenticación debe realizarse mediante el hook `useAuth`.

---

## Persistencia de sesión

La sesión del usuario se almacena en `localStorage` utilizando una única clave.

La estructura almacenada es:

```json
{
  "accessToken": "...",
  "user": { }
}
```

Al iniciar la aplicación se intenta restaurar automáticamente la sesión.

Si la información almacenada es inválida o está corrupta, se elimina automáticamente.

---

## Separación de responsabilidades

La autenticación quedó dividida en responsabilidades claramente definidas:

### AuthContext

Responsable de:

- administrar la sesión;
- guardar y eliminar la sesión;
- restaurar la sesión;
- exponer el estado global de autenticación.

---

### useAuth

Responsable de simplificar el acceso al contexto desde cualquier componente.

---

### auth.service.js

Responsable únicamente de comunicarse con el endpoint:

```
POST /auth/login
```

No contiene lógica de React.

---

### api.js

Centraliza la comunicación HTTP con el backend.

Permite reutilizar una única implementación para futuras llamadas a la API.

---

### ProtectedRoute

Protege las rutas privadas del sistema.

Si el usuario no está autenticado, es redirigido automáticamente al Login.

---

# Implementación

Se implementaron los siguientes componentes:

- AuthContext
- Hook useAuth
- Servicio de autenticación
- Cliente HTTP centralizado
- Ruta protegida
- Página Login
- Página Home protegida
- Configuración de React Router

---

## Configuración de CORS

Durante las pruebas funcionales del frontend se detectó que el navegador bloqueaba las solicitudes HTTP hacia el backend debido a la política de CORS.

Para permitir la comunicación entre la aplicación React (Vite) y el backend desarrollado con NestJS, se habilitó CORS en el archivo `src/main.ts` mediante:

```ts
app.enableCors({
  origin: 'http://localhost:5173',
});

---

# Archivos creados

```
src/
│
├── components/
│   └── auth/
│       └── ProtectedRoute.jsx
│
├── contexts/
│   └── AuthContext.jsx
│
├── hooks/
│   └── useAuth.js
│
├── pages/
│   ├── HomePage.jsx
│   └── LoginPage.jsx
│
├── routes/
│   └── AppRoutes.jsx
│
└── services/
    ├── api.js
    └── auth.service.js
```

---

# Archivos modificados

- App.jsx
- main.jsx
- index.css
- package.json
- package-lock.json
- src/main.ts (backend)

---

# Flujo de autenticación

1. El usuario accede a `/login`.

2. Completa sus credenciales.

3. `LoginPage` invoca `login()` mediante `useAuth`.

4. `AuthContext` delega la petición a `auth.service.js`.

5. `auth.service.js` realiza la llamada al backend mediante `api.js`.

6. El backend devuelve:

```json
{
  "accessToken": "...",
  "user": { }
}
```

7. `AuthContext` guarda la sesión en `localStorage`.

8. Se actualiza el estado global de autenticación.

9. El usuario es redirigido a la Home.

10. Al recargar la aplicación, `AuthContext` restaura automáticamente la sesión.

---

# Validaciones realizadas

Se verificó correctamente:

- Inicio de sesión.
- Persistencia de sesión.
- Restauración automática de sesión.
- Protección de rutas.
- Logout.
- Redirección automática al Login cuando no existe sesión.
- Compilación correcta mediante `npm run build`.

---

# Decisiones tomadas

- Se utilizó `localStorage` para la persistencia de sesión.
- Se descartó el uso de Cookies y Refresh Tokens en esta etapa.
- Se utilizó React Context como administrador del estado global.
- Se centralizó toda la comunicación HTTP.
- Se desacopló completamente la lógica de autenticación de los componentes de presentación.

---

# Fuera de alcance

No forman parte de esta etapa:

- Registro de usuarios.
- Recuperación de contraseña.
- Refresh Tokens.
- Roles y permisos del frontend.
- Dashboard definitivo.
- Sidebar.
- Header.
- Layout principal.
- Gestión de módulos del CRM.

---

# Aprendizajes

Esta etapa permitió establecer una arquitectura de autenticación simple, desacoplada y fácilmente escalable.

La separación entre Context, Hooks, Servicios HTTP y Componentes facilita el mantenimiento del proyecto y permite incorporar nuevas funcionalidades sin modificar la infraestructura existente.
