# Design System - CRM Bodega

> **Objetivo**
>
> Este documento define las reglas de experiencia de usuario (UX), interfaz (UI) y consistencia visual del CRM.
>
> Toda nueva funcionalidad deberá respetar estas reglas antes de incorporar excepciones.
>
> Este documento es la referencia oficial para el desarrollo del frontend.

---

# Filosofía

El CRM debe transmitir una imagen:

- Profesional
- Elegante
- Institucional
- Clara
- Moderna
- Consistente
- Escalable

No debe sentirse como un template genérico de administración.

La interfaz debe ayudar al usuario a trabajar de forma rápida, cómoda y predecible.

---

# Principios de Diseño

## Simplicidad

Mostrar únicamente la información necesaria.

Eliminar elementos visuales que no aporten valor.

Cada pantalla debe responder claramente a un único objetivo.

---

## Consistencia

Todas las entidades importantes del sistema deben comportarse de la misma manera.

Si el usuario aprende a utilizar un módulo, debe poder utilizar cualquier otro sin volver a aprender la interfaz.

---

## Escalabilidad

Toda decisión de diseño debe permitir agregar nuevas funcionalidades sin rediseñar el sistema.

Las pantallas deben crecer mediante componentes reutilizables.

---

## Legibilidad

La información debe poder interpretarse rápidamente.

Se priorizan:

- espacios en blanco
- buena jerarquía visual
- títulos claros
- agrupación lógica de información

---

## Productividad

El usuario trabaja varias horas utilizando el CRM.

La interfaz debe reducir el esfuerzo visual y minimizar la cantidad de clics necesarios para completar una tarea.

---

# Arquitectura de Pantallas

El sistema únicamente posee dos tipos de pantallas.

---

## 1. Listados

Los listados permiten buscar y localizar registros.

Ejemplos:

- Productos
- Clientes
- Proveedores
- Ventas
- Compras

Todos los listados respetan la misma estructura.

```
Header

↓

Toolbar

↓

Listado

↓

Paginación
```

---

## 2. Fichas

Las fichas representan una entidad individual.

No existen pantallas separadas para "Ver" y "Editar".

Cada entidad posee una única ficha donde se consulta y modifica la información.

Ejemplos:

- Ficha Producto
- Ficha Cliente
- Ficha Venta
- Ficha Compra

Todas las fichas respetan la misma estructura.

```
Volver

↓

Header

↓

Tabs

↓

Contenido

↓

Acciones
```

---

# Layout General

Todos los módulos deben respetar el siguiente layout.

```
Header

Toolbar

Contenido

Paginación
```

No se deben crear estructuras diferentes salvo casos excepcionales.

---

# Header

Debe contener:

- título
- subtítulo (cuando corresponda)
- acción principal

Ejemplo:

```
Productos

Portfolio de productos de la bodega

                           [+ Nuevo Producto]
```

---

# Toolbar

La toolbar agrupa herramientas de trabajo.

Puede contener:

- búsqueda
- filtros
- ordenamientos
- acciones secundarias

Siempre se ubica debajo del Header.

---

# Listados

Los registros se presentan mediante cards.

No se utilizarán tablas tradicionales como componente principal.

Cada card debe mostrar únicamente información resumida.

La información detallada pertenece a la ficha.

---

# Cards

Las cards deben cumplir las siguientes reglas.

## Diseño

- orientación horizontal
- bordes suaves
- separación amplia
- información resumida

## Información

Una card debe permitir identificar rápidamente:

- nombre
- categoría
- identificador
- estado

Puede incluir una breve descripción.

No debe mostrar información técnica extensa.

---

# Navegación

El flujo principal del sistema es:

```
Listado

↓

Seleccionar registro

↓

Ficha

↓

Guardar cambios

↓

Volver al listado
```

Toda entidad importante seguirá este mismo patrón.

---

# Fichas

Las fichas representan el centro de trabajo del usuario.

Toda ficha contiene:

- botón volver
- título
- identificador
- estado
- pestañas
- formulario
- acciones

---

# Header de la Ficha

Debe contener:

- nombre de la entidad
- identificador
- estado

Ejemplo:

```
Malbec Reserva 2023

PRD-000024

Activo
```

---

# Pestañas

Las pestañas permiten escalar una entidad sin rediseñar la pantalla.

Ejemplo para Productos.

- General
- Técnica
- Presentaciones
- Stock
- Historial

Las pestañas podrán agregarse progresivamente.

---

# Formularios

Los formularios siguen un único criterio.

## Escritorio

Dos columnas.

Los campos largos ocupan ambas columnas.

Ejemplo:

```
Nombre               SKU

Categoría            Estado

Descripción
```

## Mobile

Una única columna.

---

# Acciones

Todas las fichas utilizan el mismo patrón.

Izquierda

```
Cancelar
```

Derecha

```
Guardar cambios
```

El botón principal siempre será el de Guardar.

---

# Estados

Los estados se representan mediante Badges.

Ejemplos.

- Activo
- Inactivo
- Borrador
- Archivado

Evitar utilizar únicamente texto.

---

# Paginación

Toda pantalla con múltiples registros debe incorporar paginación.

Debe mostrar:

- registros visibles
- total
- página actual
- páginas disponibles
- selector de cantidad por página

---

# Componentes Base

El frontend se construirá reutilizando componentes comunes.

Inicialmente se definen los siguientes.

## Layout

- PageContainer
- PageHeader
- PageToolbar
- PagePagination

## Formularios

- TextField
- SelectField
- TextAreaField
- FormActions

## UI

- Button
- Badge
- Loading
- EmptyState

## Cards

- ProductCard
- ClientCard

Ningún módulo debe duplicar componentes existentes.

---

# Reutilización

Antes de crear un componente nuevo deben responderse las siguientes preguntas.

1. ¿Ya existe un componente similar?

2. ¿Puede reutilizarse?

3. ¿Puede hacerse configurable?

Siempre se prioriza reutilización antes que duplicación.

---

# Consistencia Visual

Todo el CRM debe transmitir una misma identidad visual.

Se prioriza:

- amplitud visual
- claridad
- poco ruido
- buena separación entre elementos

Evitar interfaces sobrecargadas.

---

# Accesibilidad

Siempre que sea posible:

- utilizar etiquetas descriptivas
- mantener buen contraste
- permitir navegación mediante teclado
- respetar foco visible

La accesibilidad forma parte del diseño.

---

# Responsive

Toda pantalla debe funcionar correctamente en:

- Desktop
- Notebook
- Tablet
- Mobile

Las fichas deben reorganizar sus formularios automáticamente.

---

# Futuras Incorporaciones

Este documento crecerá junto con el proyecto.

Próximamente incluirá:

- Paleta oficial de colores
- Tipografía
- Iconografía
- Espaciados
- Grid
- Sombras
- Border Radius
- Animaciones
- Feedback visual
- Toasts
- Confirmaciones
- Skeletons
- Estados vacíos
- Estados de error

---

# Regla Final

Toda decisión de UX/UI debe responder afirmativamente a las siguientes preguntas.

- ¿Es consistente con el resto del sistema?
- ¿Reduce la complejidad para el usuario?
- ¿Puede reutilizarse?
- ¿Permite escalar el CRM en el futuro?

Si la respuesta es "no" para alguna de ellas, la decisión debe revisarse antes de implementarse.