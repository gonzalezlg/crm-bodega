# Etapa 3 - Módulo de Clientes
commit -m "feat(clientes): implement customer management module"

## Objetivo

Implementar el primer módulo funcional del CRM, permitiendo administrar la información de los clientes mediante operaciones de alta, consulta, modificación y cambio de estado, siguiendo la arquitectura establecida para el proyecto.

---

## Funcionalidades implementadas

### Gestión de Clientes

Se implementó el módulo completo de Clientes.

Las funcionalidades incorporadas incluyen:

- Alta de clientes.
- Edición de clientes existentes.
- Consulta de clientes.
- Cambio de estado Activo/Inactivo.
- Búsqueda por nombre, apellido, DNI, teléfono o email.
- Filtrado por estado.

No se implementó eliminación física de registros, manteniendo la política de desactivación lógica definida para el proyecto.

---

### Pantalla de Clientes

Se desarrolló una pantalla específica para la administración de clientes.

La interfaz incluye:

- Listado de clientes.
- Buscador.
- Filtro por estado.
- Formulario de alta y edición.
- Confirmación para cambio de estado.
- Mensajes de éxito y error.

Se mantuvo el mismo criterio visual definido durante la implementación del Layout.

---

### Comunicación con el Backend

Se implementó un servicio específico para consumir la API REST del módulo.

Se incorporaron las operaciones:

- Obtener clientes.
- Obtener cliente por ID.
- Crear cliente.
- Actualizar cliente.
- Cambiar estado.

La autenticación continúa realizándose mediante JWT almacenado en la sesión del usuario.

---

### Validaciones

Se implementaron validaciones tanto en frontend como en backend.

Entre ellas:

- Campos obligatorios.
- Longitud máxima de los campos.
- Validación de email.
- Validación de DNI.
- Validación de teléfono.
- Prevención de registros duplicados.

Las respuestas del backend pueden contener múltiples mensajes de error, los cuales son mostrados correctamente en la interfaz.

---

### Experiencia de Usuario

Se incorporaron mejoras de usabilidad:

- Búsqueda con debounce.
- Limpieza automática de mensajes.
- Scroll automático hacia mensajes de éxito.
- Confirmación antes de modificar el estado de un cliente.
- Estados de carga durante consultas y guardado.

---

## Componentes creados

- ClientesPage
- ClienteForm
- ClientesTable
- clientesService

---

## Backend

Se implementó el módulo completo de Clientes utilizando NestJS.

Se incorporaron:

- Controller
- Service
- DTOs
- Validaciones
- Integración con Prisma

Se agregaron los endpoints necesarios para la administración del módulo.

---

## Decisiones de arquitectura

- Se reutilizó la arquitectura de autenticación implementada previamente.
- Se mantuvo la separación entre páginas, componentes y servicios.
- Se evitó duplicar lógica de consumo de API.
- Se implementó desactivación lógica en lugar de eliminación física.
- Se mantuvo una única fuente de verdad en la base de datos.
- Se respetó la arquitectura general del proyecto sin incorporar funcionalidades fuera del alcance de la etapa.

---

## Pruebas realizadas

Se verificó correctamente:

- Alta de clientes.
- Edición.
- Consulta.
- Búsqueda.
- Filtrado.
- Cambio de estado.
- Manejo de errores.
- Autenticación.
- Consumo de API.
- Compilación del backend.
- Compilación del frontend mediante `npm run build`.

Todas las pruebas fueron satisfactorias.

---

## Resultado

El CRM incorpora su primer módulo de negocio completamente funcional, estableciendo el patrón arquitectónico que será reutilizado para los restantes módulos administrativos del sistema.