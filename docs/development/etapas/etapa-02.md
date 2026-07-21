# Etapa 2 - Layout
commit -m "feat(frontend): implement main application layout"

## Objetivo

Implementar la estructura visual principal de las rutas privadas del CRM, estableciendo un layout reutilizable compuesto por Sidebar, Header y Dashboard inicial.

---

## Funcionalidades implementadas

### Layout principal

Se creó `MainLayout`, responsable de contener todas las páginas protegidas de la aplicación.

Su estructura está compuesta por:

- Sidebar lateral
- Header superior
- Área principal de contenido mediante `Outlet` de React Router

De esta manera, todas las páginas privadas compartirán la misma estructura sin duplicar código.

---

### Sidebar

Se implementó un Sidebar reutilizable que incluye:

- Nombre del sistema.
- Acceso al Dashboard.
- Accesos visuales a Clientes, Productos, Ventas y Usuarios.
- Botón de cierre de sesión.

Los módulos que aún no fueron desarrollados permanecen visibles pero deshabilitados, permitiendo anticipar la estructura futura del sistema sin exponer funcionalidades inexistentes.

La navegación fue centralizada mediante un archivo de configuración (`navigation.js`), facilitando la incorporación de nuevos módulos sin modificar el componente Sidebar.

---

### Header

Se implementó un Header reutilizable que muestra:

- Título de la página actual.
- Nombre del usuario autenticado.
- Rol del usuario.
- Botón para abrir el Sidebar en dispositivos móviles.

La información del usuario continúa obteniéndose desde `AuthContext`, manteniendo la arquitectura definida en la etapa anterior.

---

### Dashboard

Se reemplazó la pantalla inicial por un Dashboard compuesto por tarjetas reutilizables.

En esta etapa los indicadores son estáticos y representan la estructura inicial del sistema:

- Clientes
- Productos
- Ventas
- Pedidos pendientes

La información será reemplazada por datos reales en etapas posteriores.

---

### Responsive

Se implementó un comportamiento responsive básico:

- En escritorio el Sidebar permanece visible.
- En dispositivos móviles el Sidebar puede abrirse y cerrarse mediante el botón del Header.
- Se incorporó un overlay para mejorar la experiencia de navegación en pantallas pequeñas.

---

## Componentes creados

- MainLayout
- Sidebar
- Header
- NavItem
- DashboardCard

---

## Configuración

Se incorporó:

- `navigation.js` para centralizar la definición de los elementos del menú.
- `lucide-react` para la utilización de iconografía.

No se agregaron otras dependencias.

---

## Decisiones de arquitectura

- Se mantuvo la arquitectura de autenticación implementada en la Etapa 1.4.
- Se reutilizó `ProtectedRoute`.
- Se reutilizó `AuthContext`.
- Se evitó duplicar lógica de autenticación.
- Se priorizó la reutilización de componentes.
- Se evitó incorporar funcionalidades fuera del alcance de la etapa.

---

## Pruebas realizadas

Se verificó correctamente:

- Login.
- Acceso al Dashboard.
- Renderizado del Layout.
- Navegación del Sidebar.
- Estado deshabilitado de los módulos futuros.
- Logout.
- Protección de rutas.
- Persistencia de sesión.
- Funcionamiento responsive.
- Compilación mediante `npm run build`.

Todas las pruebas fueron satisfactorias.

---

## Resultado

La aplicación dispone de una estructura visual reutilizable sobre la cual podrán desarrollarse los distintos módulos del CRM sin modificar la arquitectura base.