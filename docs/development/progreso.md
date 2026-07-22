# CRM Bodega

## Estado del proyecto

**Versión:** 0.1.0
**Estado:** 🟢 En desarrollo
**Etapa actual:** Dashboard
**Próxima etapa:** Clientes
**Última actualización:** (Completar fecha)

---

# Stack Tecnológico

## Frontend

- React
- Vite
- JavaScript
- Tailwind CSS

## Backend

- NestJS
- Prisma
- PostgreSQL
- Supabase

---

# Reglas del Proyecto

## Fuente de verdad

Toda decisión funcional y de negocio debe respetar lo definido en:

`docs/planificacion-crm-bodega.md`

Este documento tiene prioridad sobre cualquier otra documentación.

En caso de conflicto entre el código y la documentación, la planificación prevalece hasta que se acuerde una modificación.

## Metodología de trabajo

Antes de comenzar una nueva funcionalidad:

- Leer la planificación.
- Revisar el estado del proyecto.
- No asumir requerimientos no documentados.
- No modificar la arquitectura sin actualizar primero la planificación.

Durante el desarrollo:

- Mantener una arquitectura limpia y consistente.
- Escribir código reutilizable.
- Evitar duplicación de lógica.
- Explicar cualquier supuesto realizado.
- Mantener nombres claros y consistentes.
- Respetar la estructura del proyecto.
- No incorporar nuevas librerías o dependencias sin justificar su necesidad.

Antes de finalizar una etapa:

- Verificar que el Backend compile correctamente.
- Verificar que el Frontend compile correctamente.
- Ejecutar las pruebas correspondientes.
- Actualizar este archivo (`progreso.md`).
- Actualizar la documentación si hubo cambios funcionales.
- Realizar el commit correspondiente.
- Verificar que las migraciones de Prisma funcionen correctamente (si hubo cambios en la base de datos). 

---

# Decisiones de Arquitectura

Estas decisiones ya fueron aprobadas y no deben modificarse sin consenso.

- Existe una única entidad **Producto**, utilizada tanto para productos terminados como para insumos.
- El stock se calcula exclusivamente a partir de movimientos.
- Los movimientos de stock son inmutables.
- Las ventas generan automáticamente movimientos de salida de stock.
- Las compras generan movimientos de stock únicamente cuando corresponda.
- El Dashboard muestra información según el rol del usuario, priorizando la información necesaria para su trabajo diario.
- Los formularios priorizan autocompletado y minimizan la carga manual de información.
- La navegación se organiza por áreas funcionales.

---

# Roadmap

0. Bootstrap
1. Autenticación
2. Dashboard
3. Clientes
4. Categorías
5. Productos
6. Reservas
7. Compras y Proveedores
8. Stock
9. Ventas
10. Gastos
11. Reportes
12. Usuarios
13. Configuración

---

# Definition of Done

Una etapa solo puede considerarse finalizada cuando:

- Funcionalidad implementada.
- Backend compilando correctamente.
- Frontend compilando correctamente.
- Pruebas realizadas.
- Documentación actualizada.
- `progreso.md` actualizado.
- Commit realizado.

---

# Checklist de Desarrollo

---

## Etapa 0 - Bootstrap
- [x] Inicializar proyecto
- [x] Configurar NestJS
- [x] Configurar React + Vite + JavaScript
- [x] Configurar Tailwind CSS
- [x] Configurar Prisma
- [x] Configurar Supabase
- [x] Configurar estructura del proyecto
- [x] Configurar .gitignore
- [x] Verificar compilación Backend
- [x] Verificar compilación Frontend
- [x] Documentar etapa
- [x] Commit

---

## Etapa 1 - Autenticación

### Modelo de datos
- [x] Configurar autenticación
- [x] Modelo Rol
- [x] Modelo Usuario
- [x] Migraciones
- [x] Seed

### Backend
- [x] Login
- [x] JWT
- [x] Roles
- [x] Guards

### Frontend
- [x] Pantalla Login
- [x] Contexto de autenticación
- [x] Protección de rutas
- [x] Logout

### Finalización
- [x] Pruebas
- [x] Documentar etapa
- [x] Commit

---

## Etapa 2 - Dashboard

- [x] Layout principal
- [x] Sidebar
- [x] Header
- [x] Dashboard inicial
- [x] Navegación
- [x] Componentes reutilizables
- [x] Responsive
- [x] Pruebas
- [x] Documentar etapa
- [x] Commit

---

## Etapa 3 - Clientes

- [ ] Modelo
- [ ] Backend
- [ ] Frontend
- [ ] CRUD
- [ ] Validaciones
- [ ] Pruebas
- [ ] Documentar etapa
- [ ] Commit

---

## Etapa 4 - Categorías

- [ ] Modelo
- [ ] Backend
- [ ] Frontend
- [ ] CRUD
- [ ] Validaciones
- [ ] Pruebas
- [ ] Documentar etapa
- [ ] Commit

---

## Etapa 5 - Productos

- [ ] Modelo
- [ ] Backend
- [ ] Frontend
- [ ] CRUD
- [ ] Búsquedas
- [ ] Validaciones
- [ ] Pruebas
- [ ] Documentar etapa
- [ ] Commit

---

## Etapa 6 - Reservas

- [ ] Modelo
- [ ] Backend
- [ ] Frontend
- [ ] Calendario
- [ ] Estados de reserva
- [ ] Confirmaciones
- [ ] Pruebas
- [ ] Documentar etapa
- [ ] Commit

---

## Etapa 7 - Compras y Proveedores

### Proveedores
- [ ] Modelo
- [ ] Backend
- [ ] Frontend
- [ ] CRUD

### Compras
- [ ] Modelo
- [ ] Backend
- [ ] Frontend
- [ ] Flujo de compra
- [ ] Integración con Stock

### Finalización
- [ ] Pruebas
- [ ] Documentar etapa
- [ ] Commit

---

## Etapa 8 - Stock

- [ ] Movimientos
- [ ] Cálculo automático
- [ ] Correcciones mediante movimientos
- [ ] Alertas de stock bajo
- [ ] Historial
- [ ] Pruebas
- [ ] Documentar etapa
- [ ] Commit

---

## Etapa 9 - Ventas

- [ ] Modelo
- [ ] Backend
- [ ] Frontend
- [ ] Flujo de venta
- [ ] Integración con Stock
- [ ] Validaciones
- [ ] Pruebas
- [ ] Documentar etapa
- [ ] Commit

---

## Etapa 10 - Gastos

- [ ] Modelo
- [ ] Backend
- [ ] Frontend
- [ ] CRUD
- [ ] Categorías
- [ ] Pruebas
- [ ] Documentar etapa
- [ ] Commit

---

## Etapa 11 - Reportes

- [ ] Dashboard definitivo
- [ ] Indicadores
- [ ] Reportes
- [ ] Filtros
- [ ] Exportación
- [ ] Pruebas
- [ ] Documentar etapa
- [ ] Commit

---

## Etapa 12 - Usuarios

- [ ] Gestión de usuarios
- [ ] Gestión de roles
- [ ] Permisos
- [ ] Pruebas
- [ ] Documentar etapa
- [ ] Commit

---

## Etapa 13 - Configuración

- [ ] Datos de la bodega
- [ ] Configuraciones generales
- [ ] Parámetros del sistema
- [ ] Pruebas
- [ ] Documentar etapa
- [ ] Commit

---

## Etapa 14 - Producción

- [ ] Variables de entorno
- [ ] Seguridad
- [ ] Optimización
- [ ] Deploy Backend
- [ ] Deploy Frontend
- [ ] Pruebas finales
- [ ] Documentación final
- [ ] Release 1.0