# Investigación Individual - Conceptos Fundamentales de Aplicaciones Web

---

## 1. Diferencia entre Página Web y Aplicación Web

Una **página web** es principalmente informativa, muestra contenido estático como un folleto digital. Por ejemplo, el sitio de un restaurante que solo muestra el menú y horarios. 

En cambio, una **aplicación web** es interactiva y procesa información del usuario. Piensa en tu banca en línea: guardas sesión, haces transferencias, consultas movimientos. 

La diferencia clave está en que la aplicación web tiene lógica de negocio compleja, maneja datos personales y requiere procesamiento en el servidor.

---

## 2. Ejemplos Reales de Aplicaciones Web Profesionales

**Notion** permite crear documentos colaborativos en tiempo real, **Figma** es una herramienta de diseño donde varios usuarios trabajan simultáneamente, **Slack** gestiona comunicación empresarial por canales, **Shopify** administra tiendas en línea completas, y **GitHub** controla versiones de código entre equipos. 

Todas estas requieren autenticación, bases de datos y sincronización constante.

---

## 3. Problemas que Resuelve el Software

El software resuelve problemas donde se necesita **velocidad, precisión y escalabilidad**. 

Por ejemplo, automatizar el registro de asistencias evita errores humanos y ahorra tiempo. Gestionar inventarios de miles de productos sería imposible manualmente. Procesar transacciones bancarias requiere seguridad y velocidad que solo el software garantiza. 

También permite análisis de datos masivos para tomar decisiones informadas.

---

## 4. Arquitectura General de Aplicaciones Web

### Frontend
El **frontend** es lo que el usuario ve y con lo que interactúa en su navegador, construido con tecnologías como React o Vue. 

### Backend
El **backend** es el cerebro que procesa solicitudes, aplica reglas de negocio y consulta bases de datos, típicamente usando Node.js, Python o Java. Estos componentes se comunican mediante APIs.

### Entornos

- **Desarrollo**: donde programas localmente en tu computadora
- **Staging**: replica el ambiente real para hacer pruebas sin afectar usuarios
- **Producción**: donde los usuarios finales utilizan la aplicación

Además se utilizan bases de datos para persistir información, contenedores Docker para empaquetar la aplicación, y servicios cloud para alojarla.

---

## 5. Análisis de 2 Plataformas Similares

### Plataforma 1: Facebook Marketplace

Facebook Marketplace permite a usuarios vender y comprar productos localmente. Utiliza tecnologías como React para el frontend y bases de datos distribuidas. 

**Fortalezas:**
- Base de usuarios masiva
- Sistema de mensajería integrado

**Debilidades:**
- No está enfocado específicamente en estudiantes
- Carece de funcionalidades académicas como intercambio de apuntes
- Sin validación institucional

---

### Plataforma 2: Mercado Libre

Mercado Libre es un marketplace completo con sistema de pagos, envíos y reputación de vendedores. Usa microservicios y arquitectura escalable. 

**Fortalezas:**
- Confianza del usuario establecida
- Logística y sistema de pagos robusto

**Debilidades:**
- No tiene categorías específicas para material académico
- No permite filtrar por universidad o carrera
- Cobra comisiones prohibitivas para estudiantes

---

## Conclusión

Un marketplace orientado a alumnos puede aprovechar la familiaridad de estos sistemas pero agregar valor con funcionalidades específicas como:

- Categorías de material académico
- Verificación institucional
- Intercambio gratuito entre compañeros
- Filtros por semestre o materia

