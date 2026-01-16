# Frontend - Marketplace de Alumnos

Este es un proyecto [Next.js](https://nextjs.org) utilizando el App Router.

## 🚀 Comenzar

Primero, instala las dependencias y ejecuta el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## 📁 Estructura de Carpetas

```
app/
├── layout.tsx                # Root layout (Next.js)
├── page.tsx                  # Landing page informativa
├── globals.css               # Estilos globales
├── favicon.ico               # Favicon de la aplicación
│
├── dashboard/
│   └── page.tsx              # Resumen de actividad del estudiante
│
├── auth/
│   ├── login/
│   │   └── page.tsx          # Botón único: "Continuar con Google"
│   └── register/
│       └── page.tsx          # Flujo inicial tras OAuth institucional
│
├── marketplace/
│   ├── page.tsx              # Listado general, búsqueda y filtros
│   ├── [id]/
│   │   └── page.tsx          # Detalle y contacto vía WhatsApp
│   └── create/
│       └── page.tsx          # Formulario de nueva publicación
│
├── profile/
│   ├── page.tsx              # "Mis Publicaciones" (activas/inactivas)
│   └── edit/
│       └── page.tsx          # Editar datos del perfil
│
├── admin/
│   └── page.tsx              # Supervisión para personal autorizado
│
├── components/               # UI Reusable (Botones, Cards, etc.)
├── hooks/                    # Lógica de estado (auth, fetch)
└── lib/                      # routes.ts, config de firebase/supabase, etc.
```

## 📄 Descripción de Rutas

### Páginas Públicas
- `/` - Landing page informativa del marketplace
- `/auth/login` - Página de inicio de sesión con Google OAuth
- `/auth/register` - Registro inicial del usuario
- `/marketplace` - Listado de todas las publicaciones

### Páginas Protegidas (requieren autenticación)
- `/dashboard` - Resumen de actividad del estudiante
- `/marketplace/create` - Crear nueva publicación
- `/marketplace/[id]` - Ver detalle de una publicación
- `/profile` - Ver y gestionar mis publicaciones
- `/profile/edit` - Editar información del perfil
- `/admin` - Panel de administración (solo personal autorizado)

## 🛠️ Tecnologías

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: CSS Modules / Tailwind CSS (por definir)
- **Autenticación**: OAuth de Google (institucional)
- **Base de datos**: Por definir (Firebase/Supabase)

## 📦 Estructura de Componentes

La carpeta `components/` contendrá componentes reutilizables como:
- Botones
- Cards de publicaciones
- Formularios
- Modales
- Navegación
- etc.

## 🔗 Hooks Personalizados

La carpeta `hooks/` contendrá lógica reutilizable como:
- `useAuth` - Gestión de autenticación
- `useFetch` - Peticiones HTTP
- `useMarketplace` - Lógica del marketplace
- etc.

## ⚙️ Configuración

La carpeta `lib/` contendrá:
- Configuración de servicios (Supabase)
- Constantes y enums
- Utilidades compartidas
- Definición de rutas (`routes.ts`)

## 📚 Recursos

- [Documentación de Next.js](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)
- [TypeScript](https://www.typescriptlang.org/)

## 🚢 Deploy

El proyecto puede ser desplegado en [Vercel](https://vercel.com/) de manera sencilla.

Consulta la [documentación de deployment de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para más detalles.
