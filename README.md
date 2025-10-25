# Proyecto Final - Sistema de Votaciones

Este repositorio contiene el proyecto completo del sistema de votaciones: frontend en React (carpeta `client`) y backend en Node/Express (carpeta `server`). Además incluye documentación del sistema de diseño y guías de despliegue.

## Contenido principal

- `client/` - Aplicación React (UI)
- `server/` - API REST en Node/Express
- `server/database/` - scripts SQL y migraciones
- `client/src/styles/` - sistema de diseño (SCSS) y guía
- Documentación en la raíz: archivos `.md` con guías, checklist y despliegue

## Archivos de documentación (enlaces)

## Enlaces directos a la documentación (navegación rápida)
- [`README_SISTEMA_DISEÑO.md`](README_SISTEMA_DISEÑO.md)
- [`DESIGN_SYSTEM_SUMMARY.md`](DESIGN_SYSTEM_SUMMARY.md)
- [`DESIGN_SYSTEM_VISUAL.md`](DESIGN_SYSTEM_VISUAL.md)
- [`client/src/styles/DESIGN_SYSTEM.md`](client/src/styles/DESIGN_SYSTEM.md)
- [`SCSS_IMPLEMENTATION_GUIDE.md`](SCSS_IMPLEMENTATION_GUIDE.md)
- [`CHECKLIST_SISTEMA_DISEÑO.md`](CHECKLIST_SISTEMA_DISEÑO.md)
- [`COMPONENT_EXAMPLES.tsx`](COMPONENT_EXAMPLES.tsx) (ejemplos de componentes)
- [`EVALUACION_REQUERIMIENTOS.md`](EVALUACION_REQUERIMIENTOS.md)
- [`DEPLOY_RENDER.md`](DEPLOY_RENDER.md)
- [`RENDER_STEPS.md`](RENDER_STEPS.md)
- [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md)
- [`STATUS.md`](STATUS.md)
- Cliente: [`client/README.md`](client/README.md)
- DB: [`server/database/README.md`](server/database/README.md)

## Archivos importantes (código que conviene revisar)
- Autenticación / JWT:
  - [`server/routes/auth.js`](server/routes/auth.js)
  - [`server/middleware/authMiddleware.js`](server/middleware/authMiddleware.js)
  - [`server/index.js`](server/index.js)
  - [`client/src/services/authService.ts`](client/src/services/authService.ts)
  - [`client/src/services/axiosConfig.ts`](client/src/services/axiosConfig.ts)
  - [`client/src/context/authContext.tsx`](client/src/context/authContext.tsx)


> Para abrir cualquiera de los documentos, haz clic en el nombre del archivo dentro del repositorio en GitHub o abre la ruta relativa en tu editor.

## Requisitos (local)

- Node.js >= 18
- npm (v8+ o la que venga con Node 18)

## Instalación y ejecución (Windows PowerShell)

1. Clona el repositorio y entra en la carpeta del proyecto:

```powershell
git clone <url-del-repo>
cd "d:\Documentos Joshua\VS\proyectofinal-dw\ProyectoFinal-DW"
```

2. Instalar dependencias (raíz ejecuta instalación del servidor automáticamente):

```powershell
npm install
```

Esto ejecutará el `postinstall` definido en `package.json` de la raíz que instala las dependencias del servidor.

3. Instalar dependencias del cliente (opcional, si deseas trabajar en frontend):

```powershell
cd client
npm install
```

4. Ejecutar el servidor backend (desde la raíz o desde `server`):

```powershell
# Desde la raíz
npm start

# O desde server (modo desarrollo con nodemon si lo prefieres)
cd server; npm run dev
```

5. Ejecutar el cliente (frontend):

```powershell
cd client
npm start
```

El cliente correrá típicamente en http://localhost:3000 y el servidor en el puerto configurado en `server/index.js` (revisa variables de entorno). Si usas `npm start` desde la raíz, este comando arranca el servidor.

## Estructura breve del proyecto

- `client/` - Código del frontend en React (TypeScript)
  - `src/` - código fuente, componentes, páginas y estilos
- `server/` - API en Node/Express
  - `database/` - scripts SQL, migraciones y seeds
  - `routes/` - endpoints (admins, auth, campaigns, profiles)

## Notas sobre despliegue

- Hay documentación específica para desplegar en Render en `DEPLOY_RENDER.md` y `RENDER_STEPS.md`.
- El `package.json` en la raíz contiene un `postinstall` para instalar dependencias de `server` y un `start` que ejecuta `node index.js` en `server` para facilitar despliegues en plataformas como Render.

## Revisión rápida de la documentación

He revisado los archivos de documentación principales (sistema de diseño y guías). Los archivos existen en las rutas indicadas y presentan información estructurada: paleta, componentes, guías de implementación y checklist. No apliqué cambios a esos ficheros en esta primera iteración —dime si quieres que haga correcciones puntuales o mejoras de estilo y las aplico.

## Contribuir

- Crea una rama con prefijo `feature/` o `fix/`.
- Abre un Pull Request contra la rama `main`.
- Incluye descripción del cambio y archivos modificados.

## Contacto

Joshua Ivan Andre Mendez Vasquez 9490-22-4032

---

Netlify: https://proyectofinal-dw.netlify.app/
Render: https://proyectofinal-dw.onrender.com
