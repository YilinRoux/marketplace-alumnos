# Reporte de QA - Marketplace Alumnos

## Reporte de Omar

**Instalación:** Exitosa mediante pnpm install.

**Ejecución:** El comando pnpm dev inicia Turbo, pero el backend falla.

**Error detectado:** Error [ERR_REQUIRE_ESM]: require() of ES Module. El sistema no soporta el uso de require para el módulo de Express cargado.

**Docker:** La configuración se encuentra en la carpeta /Docker.

## Pruebas Adicionales

**Ejecución Local (pnpm dev):** Error - Se detectó el error ERR_REQUIRE_ESM. Esto ocurre porque el sistema intenta usar require() para cargar un módulo que está configurado como ES Module.

**Entorno Docker (Conexión):** Error - Inicialmente falló con un error de conexión (error during connect). La causa fue que el motor de Docker Desktop no estaba iniciado en Windows.

**Construcción de Imagen:** Una vez iniciado Docker Desktop, el comando docker build finalizó correctamente, creando la imagen marketplace-backend.

**Prueba de Funcionamiento:** Al correr el contenedor, el backend inició sin errores y respondió con el mensaje "Backend OK" en http://localhost:4000.
