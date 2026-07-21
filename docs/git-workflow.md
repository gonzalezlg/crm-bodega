# Workflow Git del proyecto CRM Bodega

## Rama principal

main

Nunca desarrollar directamente sobre main.

---

## Reglas del proyecto

- Está prohibido desarrollar directamente sobre `main`, aunque GitHub lo permita.
- Toda funcionalidad debe desarrollarse en una rama `feature/*`.
- Todo cambio funcional debe incorporarse a `main` mediante una Pull Request.
- El bypass de la protección de `main` solo podrá utilizarse para tareas excepcionales de mantenimiento o configuración del repositorio.

---

## Flujo de trabajo

1. Crear rama feature.
2. Implementar.
3. Revisar código.
4. Probar.
5. Documentar.
6. Commit.
7. Push de la rama.
8. Crear Pull Request.
9. Revisar PR.
10. Merge a main.
11. Eliminar rama.
12. Actualizar main local.

---

## Convención de ramas

feature/etapa-3-clientes
feature/etapa-4-productos
feature/etapa-5-ventas

---

## Convención de commits

feat(...)
fix(...)
docs(...)
refactor(...)
test(...)
chore(...)