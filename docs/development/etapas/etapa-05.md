# Etapa 5 - Módulo de Productos

commit -m "feat(productos): implement product management module"

## Objetivo

Implementar el módulo de Productos del CRM, permitiendo administrar los productos comercializados por la bodega mediante un CRUD completo, integrando categorías, validaciones, búsqueda, paginación y activación lógica.

Este módulo constituye la base para futuras funcionalidades como Reservas, Compras, Stock y Ventas.

---

# Funcionalidades implementadas

## Gestión de Productos

Se implementó el módulo completo de Productos.

Las funcionalidades incorporadas incluyen:

- Alta de productos.
- Edición de productos.
- Consulta de detalle.
- Listado paginado.
- Búsqueda por nombre.
- Filtrado por categoría.
- Filtrado por estado.
- Activación y desactivación lógica.

Al igual que en el resto de los módulos administrativos, no se implementó eliminación física de registros.

Los productos permanecen almacenados y únicamente pueden cambiar su estado Activo/Inactivo.

---

## Pantalla de Productos

Se desarrolló una pantalla específica para la administración de productos.

La interfaz incluye:

- Listado paginado.
- Buscador.
- Filtro por categoría.
- Filtro por estado.
- Navegación entre páginas.
- Alta de productos.
- Edición de productos.
- Vista de detalle.
- Activación y desactivación.
- Mensajes de error.
- Estados de carga.

Se reutilizó la arquitectura visual utilizada previamente en Clientes y Categorías para mantener consistencia en toda la aplicación.

---

## Vista de Detalle

Cada producto posee una pantalla propia de consulta.

Desde ella es posible visualizar:

- Nombre.
- Categoría.
- Estado.
- Descripción.

Además permite:

- Editar el producto.
- Activarlo.
- Desactivarlo.

La actualización del estado se realiza sin recargar la página, utilizando la respuesta del backend para mantener sincronizada la interfaz.

---

## Comunicación con el Backend

Se implementó un servicio específico para consumir la API REST del módulo.

Se incorporaron las operaciones:

- Obtener productos.
- Obtener producto por ID.
- Crear producto.
- Actualizar producto.
- Cambiar estado.

Toda la comunicación continúa utilizando autenticación JWT almacenada en la sesión del usuario.

---

## Validaciones

Se implementaron validaciones tanto en frontend como en backend.

Entre ellas:

- Nombre obligatorio.
- Categoría obligatoria.
- Validaciones mediante DTOs.
- ValidationPipe.
- Normalización de textos mediante trim().
- Manejo de respuestas múltiples del backend.
- Validación defensiva de respuestas inválidas.

En la edición se contempló además el caso de productos asociados a categorías actualmente inactivas.

En dicho escenario:

- La categoría continúa visualizándose.
- Se identifica como "(inactiva)".
- No puede mantenerse al guardar.
- El usuario debe seleccionar una categoría activa antes de confirmar los cambios.

---

## Experiencia de Usuario

Se incorporaron diversas mejoras de usabilidad:

- Búsqueda con debounce.
- Paginación reutilizable.
- Estados de carga.
- Confirmación antes de desactivar productos.
- Actualización del estado sin recargar la página.
- Manejo centralizado de errores.
- Componentes reutilizables para formularios y acciones.

---

# Componentes creados

## Páginas

- ProductosPage
- ProductoDetallePage
- ProductoNuevoPage
- ProductoEditarPage

## Componentes

- ProductoCard
- ProductoForm

## Layout reutilizable

- PageContainer
- PageHeader
- PageToolbar
- PagePagination

## Componentes UI reutilizables

- Button
- Badge
- Loading
- EmptyState
- FormActions

## Servicios

- productosService

---

# Backend

Se implementó el módulo completo utilizando NestJS.

Se incorporaron:

- Modelo Producto.
- DTOs.
- Controller.
- Service.
- Validaciones.
- Integración con Prisma.

Se agregaron los endpoints necesarios para administrar el módulo.

Entre ellos:

- GET /productos
- GET /productos/:id
- POST /productos
- PATCH /productos/:id
- PATCH /productos/:id/estado

---

# Decisiones de arquitectura

Durante esta etapa se definieron las siguientes decisiones funcionales.

## Producto

Existe una única entidad Producto.

No existen entidades separadas para productos terminados e insumos.

Las futuras funcionalidades utilizarán esta misma entidad.

---

## Categorías

Todo producto debe pertenecer obligatoriamente a una categoría.

Las categorías inactivas continúan siendo válidas para productos existentes.

Sin embargo:

- No pueden seleccionarse para nuevos productos.
- No pueden mantenerse durante la edición.

Esto garantiza la integridad de los datos sin perder historial.

---

## Eliminación

Los productos no se eliminan físicamente.

La baja lógica mediante activación/desactivación constituye el único mecanismo permitido.

---

## SKU

Durante esta etapa se definió la arquitectura del SKU.

El SKU:

- Será autogenerado.
- Utilizará una secuencia de PostgreSQL.
- Tendrá formato:

PRD-000001

Podrá editarse manualmente antes de guardar.

No se implementó aún porque no resulta necesario para el MVP actual.

---

## Variantes

No se implementó soporte para variantes.

Una cosecha diferente representa un producto diferente.

No existen variantes de un mismo producto.

---

## Presentaciones

No se implementó soporte para presentaciones físicas.

Esta funcionalidad será desarrollada junto con el módulo de Stock.

---

## Packs comerciales

No se implementó soporte para packs.

Será incorporado en una etapa posterior.

---

## Ficha técnica

No se implementó la ficha técnica del producto.

Será agregada posteriormente como información complementaria.

---

## Precios

Los precios no forman parte del módulo Producto.

Serán administrados junto con los procesos comerciales correspondientes.

---

# Integración con otros módulos

Este módulo será utilizado posteriormente por:

- Reservas
- Compras
- Stock
- Ventas
- Reportes

Durante esta etapa únicamente se integró con el módulo de Categorías.

---

# Pruebas realizadas

Se verificó correctamente:

- Alta.
- Edición.
- Consulta.
- Listado.
- Paginación.
- Búsqueda.
- Filtro por categoría.
- Filtro por estado.
- Cambio de estado.
- Manejo de errores.
- Validaciones.
- Integración con Categorías.
- Compilación del backend.
- Compilación del frontend mediante npm run build.

Todas las pruebas fueron satisfactorias.

---

# Resultado

El CRM incorpora un módulo completo de administración de Productos, reutilizando la arquitectura definida para los módulos administrativos e integrándose con Categorías.

El módulo queda preparado para ser utilizado por Reservas, Compras, Stock y Ventas, manteniendo una base sólida para la evolución del sistema sin incorporar funcionalidades fuera del alcance del MVP.