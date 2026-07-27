# Etapa 06 - Motor de Reservas

> Estado: En planificación
>
> Documento maestro de la Etapa 06.
>
> Este documento constituye la especificación funcional y técnica de alto nivel del Motor de Reservas del CRM Bodega.
>
> Toda decisión de implementación deberá respetar las definiciones establecidas en este documento.

---

# 1. Objetivo

El objetivo de esta etapa es desarrollar un Motor de Reservas completamente configurable que permita administrar las experiencias ofrecidas por la bodega, su disponibilidad, capacidad y reservas.

El motor deberá centralizar toda la lógica del negocio relacionada con la disponibilidad para que pueda ser utilizada tanto por el Dashboard del CRM como por la página pública de la bodega.

El backend será la única fuente de verdad.

No deberá existir lógica de negocio duplicada entre el frontend del CRM y la página pública.

---

# 2. Alcance

Esta etapa incluye el desarrollo de los siguientes componentes.

- Gestión de experiencias.
- Configuración de disponibilidad semanal.
- Configuración de franjas horarias.
- Configuración de capacidad por horario.
- Gestión de excepciones.
- Gestión de visitantes.
- Gestión de reservas.
- Motor de cálculo de disponibilidad.
- Calendario operativo.
- API pública para reservas.

---

# 3. Fuera de alcance

Las siguientes funcionalidades no forman parte de esta etapa.

- Pagos online.
- Facturación.
- Venta de productos.
- Lista de espera.
- Recordatorios automáticos.
- Check-in mediante QR.
- Integración con Google Calendar.
- Integraciones con terceros.
- Asignación de recursos.
- Asignación de guías.
- Estadísticas.
- Multi-bodega (multi-tenant).

El diseño deberá permitir incorporar estas funcionalidades en futuras etapas sin modificar significativamente la arquitectura.

---

# 4. Arquitectura General

El Motor de Reservas será utilizado por dos consumidores principales.

- Dashboard del CRM.
- Página pública de la bodega.

Ambos consumirán exactamente la misma lógica de negocio implementada en el backend.

```

Dashboard CRM
│
│
▼
Motor de Reservas
▲
│
│
Página Web

```

Ninguno de los consumidores implementará reglas propias.

Toda validación será responsabilidad del backend.

---

# 5. Fuente de verdad

El CRM constituye la única fuente de verdad del sistema.

Toda la configuración será administrada desde el Dashboard.

La página pública únicamente podrá:

- consultar experiencias;
- consultar disponibilidad;
- consultar horarios;
- crear reservas.

Nunca administrará configuraciones.

---

# 6. Canales de creación

Inicialmente existirán dos canales de creación de reservas.

- CRM
- WEB

La arquitectura deberá permitir incorporar nuevos canales sin modificar el modelo del dominio.

Ejemplos futuros:

- WhatsApp
- Teléfono
- API externas
- Marketplaces turísticos

---

# 7. Glosario

## Experiencia

Servicio ofrecido por la bodega que puede ser reservado por un visitante.

---

## Franja Horaria

Horario semanal disponible para una experiencia.

---

## Excepción

Modificación puntual aplicada sobre una fecha específica.

Puede utilizarse para cerrar horarios, modificar capacidades o crear horarios extraordinarios.

---

## Visitante

Persona que realiza una o más reservas.

No representa necesariamente un cliente de la bodega.

---

## Cliente

Entidad perteneciente al futuro módulo Clientes.

No forma parte del Motor de Reservas.

---

## Disponibilidad

Resultado calculado dinámicamente por el sistema.

No constituye una entidad persistente.

---

# 8. Concepto principal

Todo el Motor de Reservas gira alrededor de las Experiencias.

Una reserva siempre pertenece a una única experiencia.

No existirán reservas independientes.

Ejemplos de experiencias:

- Visita Guiada
- Degustación Premium
- Almuerzo
- Sunset
- Evento Especial

Cada experiencia administrará su propia disponibilidad.

---

# 9. Modelo de Dominio

El Motor de Reservas estará compuesto por las siguientes entidades.

- Experiencia
- Franja Horaria
- Excepción
- Visitante
- Reserva

La disponibilidad no será una entidad persistente.

Será calculada dinámicamente utilizando la configuración del sistema.

```

Experiencia
│
├──────────────┐
│ │
▼ ▼
Franja Horaria Excepción
│
▼
Reserva
│
▼
Visitante

```

---

# 10. Responsabilidad de las entidades

## 10.1 Experiencia

Representa un servicio ofrecido por la bodega.

Ejemplos:

- Visita Guiada.
- Degustación.
- Almuerzo.
- Sunset.

Una experiencia define:

- nombre;
- descripción;
- duración;
- estado;
- disponibilidad semanal.

La experiencia no administra reservas.

La experiencia no calcula disponibilidad.

---

## 10.2 Franja Horaria

Representa un horario disponible para una experiencia.

Cada experiencia podrá poseer múltiples franjas horarias.

Cada franja definirá:

- día de la semana;
- hora de inicio;
- capacidad máxima;
- estado activo.

La duración será heredada desde la experiencia.

No podrán existir dos franjas con la misma combinación:

- experiencia;
- día de la semana;
- hora de inicio.

---

## 10.3 Excepción

Permite modificar la disponibilidad para una fecha específica.

Las excepciones tendrán prioridad sobre la configuración semanal.

Podrán utilizarse para:

- cerrar un horario;
- abrir un horario extraordinario;
- aumentar capacidad;
- disminuir capacidad.

Cada excepción corresponderá a una única fecha.

No podrán existir dos excepciones para la misma combinación:

- experiencia;
- fecha;
- hora de inicio.

---

## 10.4 Visitante

Representa a la persona que realiza una reserva.

Es una entidad independiente del futuro módulo Clientes.

Inicialmente almacenará:

- nombre;
- apellido;
- correo electrónico;
- teléfono;
- observaciones.

Un visitante podrá tener múltiples reservas.

El sistema intentará reutilizar visitantes existentes para evitar duplicados.

---

## 10.5 Reserva

Representa la reserva realizada por un visitante para participar de una experiencia.

Toda reserva pertenecerá a:

- una experiencia;
- un visitante;
- una fecha;
- una franja horaria.

Además almacenará:

- cantidad de personas;
- estado;
- canal de origen;
- observaciones.

La reserva conservará una copia histórica de los datos de contacto utilizados al momento de su creación para garantizar la trazabilidad del sistema.

# 11. Experiencias

Las experiencias representan los servicios que la bodega ofrece a sus visitantes y constituyen el eje central del Motor de Reservas.

Toda reserva deberá pertenecer obligatoriamente a una única experiencia.

Una experiencia podrá representar, por ejemplo:

- Visita Guiada
- Degustación Premium
- Almuerzo
- Sunset
- Evento Especial

Cada experiencia administrará su propia disponibilidad de manera completamente independiente del resto.

## 11.1 Información básica

Inicialmente una experiencia permitirá configurar:

- Nombre
- Descripción
- Duración
- Estado (Activa / Inactiva)

En futuras etapas podrán incorporarse nuevos atributos como:

- Precio
- Imagen
- Productos incluidos
- Idiomas disponibles
- Recursos necesarios
- Guía asignado
- Cantidad mínima de participantes
- Cantidad máxima configurable por temporada

La arquitectura deberá permitir incorporar dichos atributos sin modificar el funcionamiento del Motor de Reservas.

---

# 12. Franjas Horarias

Cada experiencia podrá definir múltiples franjas horarias.

Las franjas horarias representan la programación semanal habitual de una experiencia.

Ejemplo:

Lunes

- 10:00
- 12:00
- 15:00

Martes

- 10:00
- 14:00

Cada franja horaria administrará su propia capacidad máxima.

## 12.1 Configuración

Cada franja horaria deberá definir:

- Día de la semana
- Hora de inicio
- Capacidad máxima
- Estado (Activa / Inactiva)

La duración de la franja no será configurable.

Siempre será heredada desde la experiencia.

## 12.2 Restricciones

No podrán existir dos franjas con la misma combinación:

- Experiencia
- Día de la semana
- Hora de inicio

Esta restricción deberá ser garantizada por el backend.

---

# 13. Capacidad

La capacidad de una experiencia no estará determinada por la cantidad de reservas.

La capacidad estará determinada exclusivamente por la cantidad máxima de personas permitidas para cada franja horaria.

Ejemplo

Horario

12:00

Capacidad

20 personas

Reservas

Familia Pérez → 4 personas

Empresa Gómez → 8 personas

Pareja López → 2 personas

Capacidad ocupada

14 personas

Capacidad restante

6 personas

La capacidad siempre será medida en personas.

Nunca en cantidad de reservas.

---

# 14. Excepciones

Las excepciones permiten modificar la programación habitual para una fecha específica.

Su objetivo es evitar modificar la configuración semanal cuando únicamente cambia un día determinado.

## 14.1 Casos de uso

Las excepciones podrán utilizarse para:

- cerrar un horario habitual;
- modificar la capacidad;
- crear un horario extraordinario;
- habilitar un horario normalmente inexistente.

## 14.2 Prioridad

Las excepciones siempre tendrán prioridad sobre la programación semanal.

Cuando exista una excepción válida para una fecha determinada, la programación semanal dejará de aplicarse para ese horario.

## 14.3 Restricciones

No podrán existir dos excepciones para la misma combinación:

- Experiencia
- Fecha
- Hora de inicio

## 14.4 Reducción de capacidad

No será posible reducir la capacidad de una franja por debajo de la cantidad de personas ya reservadas.

Ejemplo

Capacidad actual

20 personas

Reservadas

16 personas

Nueva capacidad solicitada

10 personas

Resultado

Operación rechazada.

La capacidad mínima permitida será igual a la cantidad de personas actualmente reservadas.

---

# 15. Visitantes

Los visitantes representan a las personas que realizan reservas.

El concepto de Visitante es completamente independiente del futuro módulo Clientes.

Una persona podrá ser visitante sin convertirse nunca en cliente de la bodega.

## 15.1 Información inicial

Inicialmente cada visitante almacenará:

- Nombre
- Apellido
- Correo electrónico
- Teléfono
- Observaciones

En futuras etapas podrán incorporarse nuevos datos sin modificar el modelo del dominio.

## 15.2 Reutilización

El sistema intentará reutilizar visitantes existentes para evitar duplicación de información.

Cuando sea posible, el visitante será identificado principalmente mediante su correo electrónico.

Cuando una reserva sea creada desde el CRM sin correo electrónico, podrán utilizarse otros mecanismos de búsqueda, como el teléfono, siempre requiriendo confirmación por parte del usuario para evitar asociaciones incorrectas.

## 15.3 Relación con Reservas

Un visitante podrá poseer múltiples reservas.

Toda reserva pertenecerá obligatoriamente a un único visitante.

---

# 16. Reservas

Las reservas representan el compromiso entre un visitante y la bodega para participar en una experiencia determinada.

Cada reserva corresponderá exclusivamente a:

- una experiencia;
- un visitante;
- una fecha;
- una franja horaria.

No existirán reservas para múltiples experiencias.

No existirán reservas de varios días.

## 16.1 Información

Inicialmente una reserva almacenará:

- Experiencia
- Visitante
- Fecha
- Hora de inicio
- Cantidad de personas
- Estado
- Canal de origen
- Observaciones

Además conservará una copia histórica de los datos de contacto del visitante utilizados al momento de realizar la reserva.

Esto permitirá preservar la trazabilidad histórica aunque posteriormente el visitante modifique su información.

## 16.2 Canales de origen

Inicialmente una reserva podrá originarse desde:

- CRM
- WEB

La arquitectura deberá permitir incorporar nuevos orígenes en futuras versiones sin modificar el modelo de la reserva.

## 16.3 Estados

Inicialmente existirán los siguientes estados:

- Pendiente
- Confirmada
- Cancelada
- Asistió
- No Asistió

Cada estado representa una etapa del ciclo de vida de la reserva.

Las reglas de transición entre estados serán definidas en la sección de Reglas de Negocio.

# 17. Motor de Disponibilidad

El Motor de Disponibilidad constituye el núcleo del sistema.

Su responsabilidad será calcular dinámicamente la disponibilidad de cada experiencia utilizando la configuración definida por la bodega y el estado actual de las reservas.

La disponibilidad nunca será almacenada en la base de datos.

Siempre será calculada en tiempo real.

Esta decisión evita inconsistencias entre la configuración y las reservas existentes.

---

## 17.1 Responsabilidades

El Motor de Disponibilidad deberá ser capaz de:

- calcular la capacidad disponible;
- determinar si una reserva puede realizarse;
- obtener los horarios disponibles para una fecha;
- aplicar excepciones;
- validar modificaciones de reservas;
- validar modificaciones de capacidad.

Toda esta lógica será responsabilidad exclusiva del backend.

---

## 17.2 Orden de cálculo

La disponibilidad deberá calcularse siguiendo siempre el mismo orden.

1. Obtener la programación semanal de la experiencia.
2. Aplicar las excepciones correspondientes a la fecha consultada.
3. Obtener las reservas activas para dicho horario.
4. Calcular la cantidad de personas ya reservadas.
5. Restar la ocupación a la capacidad disponible.
6. Devolver el resultado final.

Este algoritmo deberá utilizarse tanto para el Dashboard como para la API pública.

---

## 17.3 Ventana de reservas

El sistema únicamente permitirá consultar y crear reservas dentro de una ventana configurable.

Inicialmente la ventana será de:

45 días

contados desde la fecha actual.

Esta configuración será administrada desde el CRM en una etapa futura.

La validación deberá realizarse siempre en el backend.

---

# 18. Reglas de Negocio

Las siguientes reglas constituyen el comportamiento obligatorio del Motor de Reservas.

Toda implementación deberá respetarlas.

---

## RN-01

La capacidad siempre será medida en personas.

Nunca en cantidad de reservas.

---

## RN-02

No podrá existir sobreventa.

Siempre deberá cumplirse la siguiente condición.

```
Personas reservadas
+
Nueva reserva
≤
Capacidad disponible
```

---

## RN-03

Toda validación será realizada por el backend.

Nunca dependerá del frontend.

---

## RN-04

Toda reserva pertenecerá obligatoriamente a una única experiencia.

---

## RN-05

Toda reserva pertenecerá obligatoriamente a un único visitante.

---

## RN-06

Toda reserva corresponderá únicamente a:

- una fecha;
- una franja horaria.

No existirán reservas para múltiples días.

---

## RN-07

Las excepciones tendrán prioridad sobre la programación semanal.

---

## RN-08

No podrán existir dos franjas horarias para:

- la misma experiencia;
- el mismo día;
- la misma hora.

---

## RN-09

No podrán existir dos excepciones para:

- la misma experiencia;
- la misma fecha;
- la misma hora.

---

## RN-10

Las reservas canceladas liberarán automáticamente la capacidad.

---

## RN-11

No será posible reducir la capacidad por debajo de la cantidad de personas ya reservadas.

---

## RN-12

Toda modificación de una reserva deberá volver a validar la capacidad disponible.

Modificar una reserva seguirá exactamente las mismas reglas que crear una nueva.

---

## RN-13

La disponibilidad nunca será almacenada.

Siempre será calculada dinámicamente.

---

## RN-14

Dashboard y Página Web deberán utilizar exactamente el mismo motor de cálculo.

---

# 19. Ciclo de Vida de una Reserva

Toda reserva evolucionará mediante los siguientes estados.

```
Pendiente
│
├────────► Confirmada
│
└────────► Cancelada

Confirmada
│
├────────► Asistió
│
├────────► No Asistió
│
└────────► Cancelada
```

No estarán permitidas transiciones diferentes a las definidas anteriormente.

---

## 19.1 Estados

### Pendiente

Reserva creada.

Todavía no confirmada.

---

### Confirmada

Reserva aceptada por la bodega.

Ocupa capacidad.

---

### Cancelada

Reserva anulada.

Libera automáticamente la capacidad.

---

### Asistió

El visitante realizó la experiencia.

Constituye el estado final de una reserva exitosa.

---

### No Asistió

La reserva estaba confirmada pero el visitante no se presentó.

También constituye un estado final.

---

# 20. Calendario Operativo

El Dashboard incluirá un calendario que permitirá visualizar la operación completa del Motor de Reservas.

Inicialmente permitirá:

- visualizar reservas;
- visualizar ocupación;
- crear reservas;
- editar reservas;
- cancelar reservas;
- bloquear horarios;
- modificar capacidades mediante excepciones.

El calendario constituye la principal herramienta operativa para la administración diaria.

---

# 21. API Pública

El Motor de Reservas expondrá una API pública consumida por la página web.

Inicialmente permitirá:

- consultar experiencias;
- consultar disponibilidad;
- consultar horarios;
- crear reservas.

La API pública nunca permitirá administrar configuraciones.

Toda configuración permanecerá disponible únicamente desde el Dashboard.

---

# 22. Flujo General del Sistema

El flujo funcional del Motor de Reservas será el siguiente.

```
Visitante

↓

Selecciona experiencia

↓

Selecciona fecha

↓

Motor calcula disponibilidad

↓

Selecciona horario

↓

Motor valida capacidad

↓

Se crea la reserva

↓

Se actualiza automáticamente la disponibilidad
```

Todo este flujo será administrado por el backend.

El frontend únicamente representará la información devuelta por el sistema.

## RN-15

El backend deberá garantizar que nunca se produzca sobreventa, incluso cuando existan múltiples solicitudes concurrentes para el mismo horario.

La protección frente a condiciones de carrera será responsabilidad exclusiva del backend.

# 23. Diseño Técnico de Alto Nivel

Esta sección define la arquitectura técnica general del Motor de Reservas.

No contiene código ni constituye el diseño definitivo de base de datos.

Los nombres técnicos podrán ajustarse durante la implementación, siempre que se respeten las decisiones funcionales y arquitectónicas establecidas en este documento.

---

## 23.1 Módulos principales del backend

El backend deberá organizarse en módulos con responsabilidades claramente separadas.

Inicialmente se contemplan los siguientes:

- ExperiencesModule
- TimeSlotsModule
- AvailabilityExceptionsModule
- VisitorsModule
- ReservationsModule
- AvailabilityModule

Cada módulo deberá concentrar únicamente la lógica correspondiente a su dominio.

---

## 23.2 Servicios principales

### ExperiencesService

Responsable de:

- crear experiencias;
- consultar experiencias;
- modificar experiencias;
- activar o desactivar experiencias;
- validar la información básica de una experiencia.

---

### TimeSlotsService

Responsable de:

- crear franjas horarias;
- modificar franjas horarias;
- activar o desactivar franjas;
- eliminar o deshabilitar franjas;
- validar que no existan horarios duplicados;
- validar modificaciones de capacidad.

---

### AvailabilityExceptionsService

Responsable de:

- crear excepciones;
- modificar excepciones;
- bloquear horarios;
- crear horarios extraordinarios;
- modificar capacidades para fechas específicas;
- validar que no existan excepciones duplicadas.

---

### VisitorsService

Responsable de:

- crear visitantes;
- consultar visitantes;
- buscar visitantes existentes;
- evitar duplicados cuando sea posible;
- actualizar información de contacto.

El servicio deberá normalizar los datos utilizados para identificar visitantes, especialmente:

- correo electrónico;
- teléfono.

---

### ReservationsService

Responsable de:

- crear reservas;
- modificar reservas;
- cancelar reservas;
- cambiar estados;
- consultar reservas;
- validar las transiciones de estado;
- mantener la información histórica de contacto;
- coordinar la validación de disponibilidad.

ReservationsService no deberá calcular disponibilidad por cuenta propia.

Toda validación de capacidad deberá delegarse al AvailabilityService.

---

### AvailabilityService

Responsable exclusivo de calcular y validar la disponibilidad.

Deberá poder responder, como mínimo, las siguientes preguntas:

- ¿Qué horarios están disponibles para una experiencia y fecha?
- ¿Cuál es la capacidad total de un horario?
- ¿Cuántas personas están reservadas?
- ¿Cuántas personas quedan disponibles?
- ¿Puede crearse una reserva para determinada cantidad de personas?
- ¿Puede modificarse una reserva?
- ¿Puede reducirse la capacidad?
- ¿Existe una excepción aplicable?
- ¿El horario se encuentra bloqueado?
- ¿La fecha se encuentra dentro de la ventana permitida?

La disponibilidad no deberá calcularse directamente desde controladores ni desde otros servicios.

---

# 24. Entidades Técnicas Previstas

Durante la implementación se evaluará la creación de entidades equivalentes a las siguientes:

- Experience
- TimeSlot
- AvailabilityException
- Visitor
- Reservation

Los nombres definitivos deberán respetar las convenciones existentes del proyecto.

---

## 24.1 Experience

Representará una experiencia ofrecida por la bodega.

Deberá contemplar, al menos:

- identificador;
- nombre;
- descripción;
- duración;
- estado activo;
- fecha de creación;
- fecha de actualización.

---

## 24.2 TimeSlot

Representará una franja horaria semanal.

Deberá contemplar, al menos:

- identificador;
- experiencia;
- día de la semana;
- hora de inicio;
- capacidad máxima;
- estado activo;
- fecha de creación;
- fecha de actualización.

Deberá existir una restricción única para:

- experiencia;
- día de la semana;
- hora de inicio.

---

## 24.3 AvailabilityException

Representará una modificación puntual de disponibilidad.

Deberá contemplar, al menos:

- identificador;
- experiencia;
- referencia opcional a una franja horaria;
- fecha;
- hora de inicio;
- estado habilitado o bloqueado;
- capacidad especial opcional;
- motivo opcional;
- estado activo;
- fecha de creación;
- fecha de actualización.

La referencia a la franja horaria será opcional.

Cuando exista, la excepción modificará una franja habitual.

Cuando no exista, podrá representar un horario extraordinario.

Deberá existir una restricción única para:

- experiencia;
- fecha;
- hora de inicio.

---

## 24.4 Visitor

Representará a la persona que realiza una reserva.

Deberá contemplar, al menos:

- identificador;
- nombre;
- apellido;
- correo electrónico opcional;
- teléfono;
- observaciones opcionales;
- estado activo;
- fecha de creación;
- fecha de actualización.

El correo electrónico deberá almacenarse normalizado.

El teléfono también deberá normalizarse antes de utilizarse para búsquedas o comparación.

---

## 24.5 Reservation

Representará una reserva.

Deberá contemplar, al menos:

- identificador;
- experiencia;
- visitante;
- fecha de la experiencia;
- hora de inicio;
- cantidad de personas;
- estado;
- canal de origen;
- observaciones;
- copia histórica del nombre;
- copia histórica del apellido;
- copia histórica del correo electrónico;
- copia histórica del teléfono;
- fecha de creación;
- fecha de actualización;
- fecha de confirmación opcional;
- fecha de cancelación opcional;
- fecha de asistencia opcional.

---

# 25. Enumeraciones Previstas

Durante la implementación se contemplarán enumeraciones equivalentes a las siguientes.

## Estado de reserva

- PENDING
- CONFIRMED
- CANCELLED
- ATTENDED
- NO_SHOW

---

## Canal de reserva

- CRM
- WEB

La enumeración deberá permitir incorporar nuevos valores en el futuro.

---

## Día de la semana

Podrá representarse mediante una enumeración consistente con las convenciones del backend.

Ejemplo:

- MONDAY
- TUESDAY
- WEDNESDAY
- THURSDAY
- FRIDAY
- SATURDAY
- SUNDAY

---

# 26. Endpoints de Alto Nivel

Los endpoints definitivos se establecerán durante la implementación.

Como referencia, el módulo deberá contemplar operaciones equivalentes a las siguientes.

---

## 26.1 Experiencias

- crear experiencia;
- listar experiencias;
- obtener experiencia;
- modificar experiencia;
- activar o desactivar experiencia.

---

## 26.2 Franjas Horarias

- crear franja horaria;
- listar franjas de una experiencia;
- modificar franja;
- activar o desactivar franja;
- eliminar o deshabilitar franja.

---

## 26.3 Excepciones

- crear excepción;
- listar excepciones;
- modificar excepción;
- eliminar o deshabilitar excepción;
- bloquear horario;
- habilitar horario extraordinario.

---

## 26.4 Visitantes

- crear visitante;
- buscar visitante;
- obtener visitante;
- actualizar visitante.

No será obligatorio desarrollar una pantalla independiente de visitantes durante esta etapa.

La entidad deberá quedar correctamente integrada con Reservas.

---

## 26.5 Reservas

- crear reserva;
- listar reservas;
- obtener reserva;
- modificar reserva;
- cancelar reserva;
- confirmar reserva;
- marcar asistencia;
- marcar ausencia.

---

## 26.6 Disponibilidad

- consultar disponibilidad por experiencia y fecha;
- consultar horarios disponibles;
- consultar capacidad de un horario;
- validar disponibilidad antes de crear o modificar una reserva.

---

## 26.7 API Pública

La API pública deberá exponer únicamente las operaciones necesarias para la página web.

Inicialmente:

- listar experiencias activas;
- consultar disponibilidad;
- consultar horarios;
- crear una reserva.

No deberá permitir:

- modificar configuraciones;
- crear excepciones;
- modificar capacidades;
- cambiar estados administrativos;
- consultar información interna del CRM.

---

# 27. Seguridad y Autorización

Los endpoints administrativos deberán encontrarse protegidos mediante autenticación.

La autorización deberá respetar el sistema de roles existente en el CRM.

La API pública solo expondrá las operaciones expresamente definidas como públicas.

El backend deberá validar siempre:

- datos recibidos;
- permisos;
- existencia de entidades relacionadas;
- reglas de negocio;
- disponibilidad;
- transiciones de estado.

La seguridad no deberá depender de que una acción esté oculta en el frontend.

---

# 28. Concurrencia y Prevención de Sobreventa

La prevención de sobreventa deberá resolverse exclusivamente en el backend.

La validación de disponibilidad y la creación o modificación de una reserva deberán ejecutarse de manera segura frente a solicitudes simultáneas.

El mecanismo técnico definitivo podrá utilizar:

- transacciones;
- bloqueos;
- nivel de aislamiento apropiado;
- control optimista;
- otra estrategia compatible con PostgreSQL y Prisma.

La solución elegida deberá garantizar que dos solicitudes concurrentes no puedan superar la capacidad del horario.

La comprobación previa realizada por el frontend no será suficiente.

---

# 29. Fechas, Horas y Zona Horaria

El sistema deberá manejar las fechas y horas de forma consistente.

La fecha de una reserva representa el día local en el que se realizará la experiencia.

La hora de inicio representa el horario local de la bodega.

La implementación deberá evitar desplazamientos incorrectos producidos por conversiones automáticas de zona horaria.

Antes de definir el modelo Prisma se deberá decidir expresamente:

- cómo se almacenarán las fechas sin hora;
- cómo se almacenarán las horas de inicio;
- cuál será la zona horaria operativa de la bodega;
- cómo se convertirán las fechas en la API pública.

Esta decisión técnica deberá documentarse antes de crear la migración correspondiente.

---

# 30. Configuración General y Módulos Opcionales

El Motor de Reservas deberá diseñarse como un módulo independiente.

En una etapa futura, el CRM permitirá habilitar o deshabilitar módulos según los servicios contratados por cada bodega.

Cuando el módulo de Reservas esté deshabilitado:

- no deberá mostrarse en el menú;
- no deberán mostrarse sus pantallas;
- no deberán habilitarse sus rutas;
- la API pública de reservas no deberá estar disponible;
- el backend deberá rechazar las operaciones relacionadas.

Esta funcionalidad no será implementada durante la Etapa 06.

La Etapa 06 asumirá que el módulo se encuentra habilitado.

---

# 31. Independencia respecto del Módulo Clientes

El Motor de Reservas deberá funcionar sin depender del módulo Clientes.

Las reservas utilizarán la entidad Visitante.

Un visitante no será automáticamente un cliente.

En una etapa futura podrá incorporarse:

- vinculación entre Visitante y Cliente;
- conversión de Visitante en Cliente;
- creación de Cliente a partir de una compra;
- unificación de historiales.

Ninguna de estas posibilidades deberá generar una dependencia obligatoria durante esta etapa.

---

# 32. Arquitectura de Desarrollo

La Etapa 06 se dividirá en los siguientes bloques.

---

## 6.1 Experiencias y Franjas Horarias

Incluye:

- modelo de experiencia;
- CRUD de experiencias;
- activación y desactivación;
- modelo de franjas horarias;
- CRUD de franjas;
- capacidad por horario;
- validación de duplicados.

En este bloque todavía no existirán reservas.

---

## 6.2 Excepciones y Motor de Disponibilidad

Incluye:

- modelo de excepciones;
- cierre de horarios;
- modificación puntual de capacidad;
- horarios extraordinarios;
- cálculo de disponibilidad;
- aplicación de programación semanal;
- aplicación de excepciones;
- validación de ventana de reserva.

---

## 6.3 Visitantes y Reservas

Incluye:

- modelo de visitantes;
- identificación y reutilización;
- modelo de reservas;
- creación;
- modificación;
- cancelación;
- estados;
- transiciones;
- validaciones;
- prevención de sobreventa.

---

## 6.4 Calendario Operativo

Incluye:

- visualización de reservas;
- visualización de ocupación;
- creación desde calendario;
- edición;
- cancelación;
- bloqueo de horarios;
- modificación puntual de capacidades.

---

## 6.5 API Pública

Incluye:

- experiencias activas;
- disponibilidad pública;
- horarios disponibles;
- creación de reservas desde la web;
- validaciones equivalentes a las del Dashboard.

---

# 33. Plan de Implementación

Cada bloque deberá implementarse de manera incremental.

Para cada subetapa se deberá seguir este proceso:

1. Confirmar el alcance de la subetapa.
2. Definir el diseño técnico concreto.
3. Revisar el modelo Prisma.
4. Crear o modificar migraciones.
5. Implementar backend.
6. Implementar frontend cuando corresponda.
7. Validar compilación.
8. Ejecutar pruebas manuales.
9. Revisar los archivos completos modificados.
10. Documentar el avance.
11. Crear el commit correspondiente.
12. Continuar con la siguiente subetapa.

No se deberán implementar funcionalidades pertenecientes a bloques posteriores antes de cerrar y validar el bloque actual.

---

# 34. Criterios Generales de Aceptación

La Etapa 06 se considerará terminada cuando:

- sea posible crear y administrar experiencias;
- sea posible definir franjas horarias;
- cada horario tenga capacidad propia;
- sea posible crear excepciones;
- las excepciones prevalezcan sobre la programación semanal;
- la disponibilidad se calcule dinámicamente;
- no se produzca sobreventa;
- se puedan crear visitantes;
- se puedan crear y modificar reservas;
- las reservas respeten las transiciones de estado;
- las cancelaciones liberen capacidad;
- exista un calendario operativo;
- la página pública pueda consultar disponibilidad;
- la página pública pueda crear reservas;
- Dashboard y página pública compartan las mismas reglas;
- todas las validaciones críticas sean realizadas por el backend;
- el proyecto compile correctamente;
- la documentación quede actualizada.

---

# 35. Principios de Diseño

Todo el desarrollo deberá respetar los siguientes principios.

- El backend es la única fuente de verdad.
- La lógica de negocio nunca dependerá del frontend.
- Dashboard y página pública utilizarán las mismas reglas.
- La disponibilidad nunca será almacenada.
- La disponibilidad siempre será calculada.
- La capacidad siempre se medirá en personas.
- No podrá existir sobreventa.
- Las excepciones tendrán prioridad sobre la programación semanal.
- Los módulos deberán permanecer desacoplados.
- El Motor de Reservas no dependerá del módulo Clientes.
- Toda decisión técnica deberá respetar las reglas de negocio.
- No se agregarán funcionalidades fuera del alcance aprobado.
- La implementación será incremental.
- Cada bloque deberá validarse antes de avanzar.

---

# 36. Decisiones de Arquitectura

## ADR-001 — Sistema para una única bodega

### Decisión

El CRM será desarrollado inicialmente para una única bodega.

### Motivo

Reducir la complejidad del MVP y evitar incorporar aislamiento multi-tenant antes de ser necesario.

### Impacto

Las entidades no incluirán inicialmente una referencia obligatoria a una bodega o tenant.

### Revisión futura

Esta decisión deberá revisarse si el producto evoluciona hacia una plataforma SaaS multi-bodega.

---

## ADR-002 — Disponibilidad calculada

### Decisión

La disponibilidad no será almacenada en la base de datos.

### Motivo

La disponibilidad depende de:

- programación semanal;
- excepciones;
- reservas;
- estados;
- capacidad.

Persistirla podría generar inconsistencias.

### Impacto

Toda consulta deberá utilizar el AvailabilityService.

---

## ADR-003 — Capacidad medida en personas

### Decisión

La capacidad será medida exclusivamente por cantidad de personas.

### Motivo

Una reserva puede incluir múltiples participantes.

La cantidad de reservas no representa la ocupación real.

---

## ADR-004 — Backend como fuente de verdad

### Decisión

Toda validación crítica será realizada por el backend.

### Motivo

Evitar inconsistencias, manipulaciones desde el cliente y reglas duplicadas.

---

## ADR-005 — Visitante independiente de Cliente

### Decisión

Las reservas se relacionarán con Visitantes y no con Clientes.

### Motivo

Una persona puede visitar la bodega sin mantener una relación comercial.

### Impacto

El Motor de Reservas podrá funcionar aunque el módulo Clientes no esté contratado o habilitado.

---

## ADR-006 — Copia histórica de contacto

### Decisión

La Reserva almacenará una copia histórica de los datos de contacto utilizados en su creación.

### Motivo

Preservar trazabilidad aunque el Visitante modifique posteriormente sus datos.

---

## ADR-007 — Excepciones con prioridad

### Decisión

Las excepciones prevalecerán sobre la programación semanal.

### Motivo

Permitir cambios puntuales sin modificar la configuración habitual.

---

## ADR-008 — Prevención de sobreventa en backend

### Decisión

La protección frente a solicitudes concurrentes será responsabilidad del backend.

### Motivo

Una validación realizada únicamente antes de enviar la solicitud no evita condiciones de carrera.

### Impacto

La creación y modificación de reservas deberá ejecutarse mediante una estrategia transaccional segura.

---

## ADR-009 — Módulos opcionales

### Decisión

El CRM deberá permitir en el futuro habilitar o deshabilitar módulos.

### Motivo

Permitir diferentes planes comerciales y configuraciones según los servicios contratados.

### Impacto actual

La funcionalidad no se implementará en la Etapa 06, pero el Motor de Reservas deberá mantenerse desacoplado.

---

## ADR-010 — Único documento maestro

### Decisión

`docs/etapa-06.md` será la única fuente de verdad de la Etapa 06.

### Motivo

Evitar documentación duplicada o contradictoria.

### Impacto

El documento deberá mantenerse actualizado durante toda la implementación.

---

# 37. Evoluciones Futuras

El diseño deberá permitir incorporar en etapas futuras:

- precios;
- pagos online;
- depósitos o señas;
- recordatorios automáticos;
- confirmaciones por correo;
- confirmaciones por WhatsApp;
- lista de espera;
- check-in;
- códigos QR;
- múltiples idiomas;
- guías asignados;
- recursos;
- cupos por recurso;
- experiencias privadas;
- promociones;
- venta de entradas;
- integración con Google Calendar;
- integración con marketplaces;
- estadísticas;
- reportes;
- historial avanzado de visitantes;
- conversión de visitantes en clientes;
- módulos habilitables;
- múltiples bodegas;
- configuración de branding;
- reglas diferentes según experiencia;
- confirmación automática o manual por experiencia.

Estas funcionalidades no forman parte del alcance actual.

---

# 38. Estado del Documento

Este documento permanecerá en estado:

En planificación

hasta que se apruebe el diseño técnico concreto de la primera subetapa.

Durante la implementación deberá actualizarse para reflejar:

- decisiones definitivas;
- cambios aprobados;
- alcance implementado;
- pruebas realizadas;
- estado de cada bloque.

Al finalizar la Etapa 06, el estado deberá cambiarse a: Completada

# 39. Notas para la implementación

Las decisiones funcionales definidas en este documento tienen prioridad sobre cualquier decisión técnica.

Durante la implementación podrán realizarse ajustes técnicos siempre que:

- no modifiquen las reglas de negocio;
- no alteren el modelo del dominio;
- no cambien el comportamiento funcional aprobado.

Si durante el desarrollo surge la necesidad de modificar una decisión funcional, el cambio deberá realizarse primero en este documento y luego implementarse en el código.

Este documento constituye la referencia oficial para toda la Etapa 06.