# Marketplace entre Alumnos

Aplicación web tipo **marketplace** diseñada para que alumnos puedan **publicar, vender, intercambiar o solicitar productos y servicios** dentro de su comunidad educativa.

>  **Carpeta principal para entregables:** `apps/doc7tareaindividual`  
> Contiene todos los documentos y entregables individuales y de equipo (PDFs, definiciones, investigaciones).

El proyecto está construido siguiendo **buenas prácticas de la industria**, usando un **monorepo**, automatización con **CI/CD** y herramientas modernas desde el inicio.

---

## Objetivo del Proyecto

Resolver la necesidad de un espacio digital seguro y centralizado donde los alumnos puedan realizar intercambios de manera sencilla, accesible y escalable mediante una **aplicación web**.

---

## Stack Tecnológico

### Frontend
- Next.js
- TypeScript

### Backend
- Express
- TypeScript

### Infraestructura y DevOps
- Turborepo (Monorepo)
- pnpm (gestor de paquetes)
- Docker
- GitHub Actions (CI/CD)

---

## Estructura del Proyecto



apps/
frontend → Aplicación web (Next.js)
backend → API (Express)
docs → Documentación del proyecto
tareaindividual → Entregables individuales y de equipo

packages/
configuraciones compartidas


---

## Instalación y Ejecución

### Requisitos
- Node.js >= 18
- pnpm

### Instalar dependencias
```bash
pnpm install

Levantar el proyecto (frontend + backend)
pnpm dev


Frontend: http://localhost:3000

Backend: http://localhost:4000

CI/CD

El proyecto cuenta con un pipeline de integración continua configurado con GitHub Actions, el cual:

Instala dependencias

Ejecuta procesos de build

Valida que el proyecto compile correctamente


Flujo de Ramas

main → Rama estable

dev → Rama de desarrollo

feature/* → Nuevas funcionalidades

Ejemplo:

feature/devops-setup

Roles del Equipo

TL (Tech Lead): Arquitectura y decisiones técnicas

FE (Frontend): Desarrollo de la interfaz

BE (Backend): Desarrollo de la API

DO (DevOps): Monorepo, Docker y CI/CD

QA: Testing y control de calidad

Estado del Proyecto

Proyecto en fase inicial, preparado para crecer de forma escalable siguiendo prácticas reales de la industria.
La carpeta tareaindividual contiene los entregables individuales y de equipo, incluyendo documentos, investigación y definiciones de proyecto.
