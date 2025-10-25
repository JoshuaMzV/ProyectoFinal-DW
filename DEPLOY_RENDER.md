# 🚀 Guía de Despliegue en Render

## ✅ Fase 1: Base de Datos PostgreSQL (COMPLETADA)

La base de datos ya está creada en Render con estas credenciales:
```
Hostname: dpg-d3u6flndiees73e136mg-a
Port: 5432
Username: votaciones_user
Password: g3jY1mvVbUK3cudYR7CR3RLqZpWEFF00
Database: votaciones_db_kutb
```

**URL de conexión (con SSL):**
```
postgresql://votaciones_user:g3jY1mvVbUK3cudYR7CR3RLqZpWEFF00@dpg-d3u6flndiees73e136mg-a/votaciones_db_kutb
```

---

## 📦 Fase 2: Backend Node.js (Próximo paso)

### Paso 1: Conectar tu repositorio a Render
1. Ve a https://dashboard.render.com
2. Click en **"New +"** → **"Web Service"**
3. Selecciona tu repositorio `ProyectoFinal-DW` en GitHub
4. Llena los datos:

| Campo | Valor |
|-------|-------|
| **Name** | `proyecto-votaciones-backend` |
| **Environment** | `Node` |
| **Region** | `Oregon (US West)` (mismo de BD) |
| **Branch** | `main-final` |
| **Build Command** | `cd server && npm install` |
| **Start Command** | `node server/index.js` |
| **Plan** | `Free` |

### Paso 2: Configurar variables de entorno
En Render, ve a **Settings** → **Environment** y agrega:

```env
NODE_ENV=production
DATABASE_URL=postgresql://votaciones_user:g3jY1mvVbUK3cudYR7CR3RLqZpWEFF00@dpg-d3u6flndiees73e136mg-a/votaciones_db_kutb
DB_SSL=true
JWT_SECRET=mi_secreto_jwt_super_seguro
FRONTEND_URL=https://proyecto-votaciones-frontend.onrender.com
```

### Paso 3: Desplegar
Click en **"Deploy"** y espera 5-10 minutos.

Tu backend estará disponible en:
```
https://proyecto-votaciones-backend.onrender.com
```

---

## 🎨 Fase 3: Frontend React (Después del Backend)

### Paso 1: Conectar repositorio
1. Click en **"New +"** → **"Static Site"**
2. Selecciona `ProyectoFinal-DW`
3. Llena los datos:

| Campo | Valor |
|-------|-------|
| **Name** | `proyecto-votaciones-frontend` |
| **Environment** | `Node` |
| **Region** | `Oregon (US West)` |
| **Branch** | `main-final` |
| **Build Command** | `cd client && npm install && npm run build` |
| **Publish Directory** | `client/build` |
| **Plan** | `Free` |

### Paso 2: Configurar variables de entorno
En Render, ve a **Settings** → **Environment** y agrega:

```env
REACT_APP_API_URL=https://proyecto-votaciones-backend.onrender.com/api
```

### Paso 3: Desplegar
Click en **"Deploy"** y espera 5-10 minutos.

Tu frontend estará disponible en:
```
https://proyecto-votaciones-frontend.onrender.com
```

---

## 🔄 Paso 4: Sincronizar URLs

**En el Backend (.env o variables Render):**
```env
FRONTEND_URL=https://proyecto-votaciones-frontend.onrender.com
```

**En el Frontend (client/.env o variables Render):**
```env
REACT_APP_API_URL=https://proyecto-votaciones-backend.onrender.com/api
```

---

## 🗄️ Paso 5: Importar esquema de BD

Una vez el backend esté deployado, ejecuta los scripts SQL en Render:

1. Ve a tu BD en Render Dashboard
2. Click en **"Connect"** → **"Query"**
3. Copia y ejecuta el contenido de `server/database/all.sql`

**O usa psql desde terminal:**
```bash
psql "postgresql://votaciones_user:g3jY1mvVbUK3cudYR7CR3RLqZpWEFF00@dpg-d3u6flndiees73e136mg-a/votaciones_db_kutb" < server/database/all.sql
```

---

## ✅ Verificación

### Test Backend
```bash
curl https://proyecto-votaciones-backend.onrender.com/api/auth/login
# Debe retornar: {"message": "Email and password are required."}
```

### Test Frontend
Abre en navegador:
```
https://proyecto-votaciones-frontend.onrender.com
```

---

## ⚠️ Notas importantes

1. **Cold starts**: En plan Free, el servicio se detiene después de 15 minutos sin uso. La próxima solicitud tardará 30-50 segundos.
2. **SSL obligatorio**: Render USA HTTPS por defecto ✅
3. **CORS**: Asegúrate de que `FRONTEND_URL` está en la lista de orígenes permitidos
4. **Logs**: Ve a **Settings** → **Logs** en Render para debuggear errores
5. **Base de datos**: Tiene 100 MB almacenamiento gratuito

---

## 🚨 Si algo falla

### Error de conexión a BD
- Verifica que `DATABASE_URL` sea exacta
- Comprueba que `DB_SSL=true`
- Revisa los logs en Render

### Error de CORS
- Actualiza `FRONTEND_URL` en el backend
- Actualiza `REACT_APP_API_URL` en el frontend

### Tabla no existe
- Ejecuta los scripts SQL en Render Query
- Verifica que `all.sql` tiene el schema completo

---

## 📝 Resumen de URLs finales

```
Frontend:  https://proyecto-votaciones-frontend.onrender.com
Backend:   https://proyecto-votaciones-backend.onrender.com
API:       https://proyecto-votaciones-backend.onrender.com/api
BD:        postgresql://votaciones_user:...@dpg-d3u6flndiees73e136mg-a/votaciones_db_kutb
```

¡Tu proyecto está listo para producción! 🎉🗳️
