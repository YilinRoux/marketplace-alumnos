# Guía de Contribución

Este documento establece las normas y procedimientos que deben seguir todos los miembros del equipo al contribuir al repositorio de UniMarket.

## Estrategia de Ramas

### Ramas Principales

- **`main`**: Rama de producción. Solo contiene código estable y aprobado.
- **`dev`**: Rama de desarrollo. Aquí se integran las features antes de pasar a `main`.

### Ramas de Trabajo

Nadie debe realizar commits directamente a `main`. Todo desarrollo debe hacerse en ramas específicas siguiendo esta nomenclatura:

- **Features:** `feat/nombre-de-la-funcionalidad`
  - Ejemplo: `feat/user-authentication`
  
- **Correcciones:** `fix/descripcion-del-bug`
  - Ejemplo: `fix/login-validation-error`
  
- **Documentación:** `docs/nombre-del-documento`
  - Ejemplo: `docs/api-endpoints`
  
- **Tareas de mantenimiento:** `chore/descripcion-tarea`
  - Ejemplo: `chore/update-dependencies`

### Flujo de Trabajo

1. Crear una rama desde `dev`
2. Realizar los cambios necesarios
3. Hacer commit siguiendo las convenciones establecidas
4. Abrir un Pull Request hacia `dev`
5. Esperar aprobación y merge

## Conventional Commits

Todos los commits deben seguir el estándar de Conventional Commits para mantener un historial claro y semántico.

### Formato

```
<tipo>: <descripción breve>

[cuerpo opcional]
```

### Tipos Permitidos

- **`feat`**: Nueva funcionalidad
  - Ejemplo: `feat: add login endpoint`
  
- **`fix`**: Corrección de errores
  - Ejemplo: `fix: resolve null pointer in user service`
  
- **`docs`**: Cambios en documentación
  - Ejemplo: `docs: update README with new instructions`
  
- **`chore`**: Tareas de mantenimiento
  - Ejemplo: `chore: update dependencies`
  
- **`refactor`**: Refactorización de código
  - Ejemplo: `refactor: improve database connection logic`
  
- **`test`**: Añadir o modificar pruebas
  - Ejemplo: `test: add unit tests for auth service`
  
- **`style`**: Cambios de formato (no afectan la lógica)
  - Ejemplo: `style: format code with prettier`

### Buenas Prácticas

- Usar minúsculas en la descripción
- No terminar con punto final
- Ser específico y conciso
- Escribir en español
- Limitar la primera línea a 72 caracteres

## Pull Requests

### Requisitos Obligatorios

Todo Pull Request debe cumplir con los siguientes criterios antes de ser mergeado:

1. **Aprobación del Tech Lead**: Imanol Antonio debe revisar y aprobar el PR.
2. **CI/CD en verde**: Todos los checks automatizados deben pasar exitosamente.
3. **Sin conflictos**: El PR debe estar actualizado con la rama destino.
4. **Descripción clara**: Debe incluir qué cambios se realizaron y por qué.

### Plantilla de Pull Request

Al crear un PR, incluye la siguiente información:

```markdown
## Descripción
[Explica brevemente qué cambios introduces]

## Tipo de cambio
- [ ] Nueva funcionalidad (feat)
- [ ] Corrección de bug (fix)
- [ ] Documentación (docs)
- [ ] Refactorización (refactor)
- [ ] Otro (especificar)

## ¿Cómo se probó?
[Describe las pruebas realizadas]

## Checklist
- [ ] El código compila sin errores
- [ ] Se ejecutaron pruebas locales
- [ ] Se siguió la convención de commits
- [ ] Se actualizó la documentación si fue necesario
```

### Proceso de Revisión

1. El autor del PR asigna a Imanol Antonio como revisor
2. El revisor examina el código y deja comentarios si es necesario
3. El autor realiza los cambios solicitados
4. Una vez aprobado y con CI/CD en verde, el Tech Lead hace el merge

## Estándares de Calidad

### Antes de Subir Código

El responsable de cada cambio debe garantizar que:

1. **El código compila**: No debe haber errores de compilación.
2. **Las pruebas pasan**: Ejecutar pruebas localmente antes de hacer push.
3. **El código está limpio**: Sin console.logs innecesarios ni código comentado.
4. **Se respetan las convenciones**: Seguir el estilo de código establecido.

### Responsabilidad de QA

Kevin Omar, como responsable de QA, realizará validaciones adicionales de:

- Funcionalidad completa de las features
- Casos edge detectados
- Regresiones en funcionalidades existentes

## Comunicación

- Las dudas técnicas deben discutirse en el canal de desarrollo del equipo.
- Las decisiones arquitectónicas importantes deben ser aprobadas por el Tech Lead.
- Los bloqueos o impedimentos deben comunicarse de inmediato.

## Penalizaciones

El incumplimiento de estas normas puede resultar en:

- Rechazo del Pull Request
- Solicitud de rehacer el trabajo siguiendo los estándares
- Revisión adicional por parte del Tech Lead

Mantener estos estándares es responsabilidad de todos los miembros del equipo y garantiza la calidad y mantenibilidad del proyecto.