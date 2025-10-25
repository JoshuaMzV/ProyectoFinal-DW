## 🚀 PRÓXIMOS PASOS: DESPLIEGUE EN RENDER

Tu backend está completamente configurado con PostgreSQL. Aquí van los pasos exactos para desplegarlo:

---

## 📋 CHECKLIST PRE-DESPLIEGUE

- ✅ Base de datos PostgreSQL creada en Render
- ✅ Credenciales guardadas en `server/.env`
- ✅ Backend configurado con `DATABASE_URL` y `DB_SSL=true`
- ✅ CORS configurado dinámicamente
- ✅ JWT integrado
- ✅ Commit pusheado a `main-final`

---

## 🎯 PASOS PARA DESPLEGAR BACKEND EN RENDER

### 1️⃣ Ve a https://dashboard.render.com

### 2️⃣ Crea el Web Service
- Click en **"New +"** → **"Web Service"**
- Selecciona **"ProyectoFinal-DW"** de tu GitHub

### 3️⃣ Configura los detalles del servicio

**General:**
```
Name:                  proyecto-votaciones-backend
Runtime Environment:   Node
Region:                Oregon (US West)  [mismo de la BD]
Branch:                main-final
```

**Build & Deploy:**
```
Build Command:  npm install && npm install -g nodemon
Start Command:  cd server && node index.js
Root Directory: [dejar vacío - raíz del repo]
```

**Plan:**
```
Free
```

### 4️⃣ Configura Environment Variables

Ve a **Settings** → **Environment** y agrega estas variables:

```env
NODE_ENV=production
DATABASE_URL=postgresql://votaciones_user:g3jY1mvVbUK3cudYR7CR3RLqZpWEFF00@dpg-d3u6flndiees73e136mg-a/votaciones_db_kutb
DB_SSL=true
JWT_SECRET=mi_secreto_jwt_super_seguro
FRONTEND_URL=https://proyecto-votaciones-frontend.onrender.com
```

⚠️ **IMPORTANTE:** El `JWT_SECRET` debe ser complejo en producción. Cambiar después de ir en vivo.

### 5️⃣ Deploy

Click en **"Create Web Service"**

Render tardará **5-10 minutos** compilando e iniciando el servidor.

**Espera a ver:**
```
✓ Deployed successfully
```

### 6️⃣ Copiar la URL del backend

Una vez deployado, Render te dará una URL como:
```
https://proyecto-votaciones-backend.onrender.com
```

✅ **Guarda esta URL** - la necesitarás para el frontend

---

## 🧪 VERIFICAR QUE EL BACKEND FUNCIONA

Después de que esté deployado, prueba estos endpoints:

### Test 1: Health Check
```bash
curl https://proyecto-votaciones-backend.onrender.com
```
**Respuesta esperada:**
```
¡El servidor de la API de votaciones está funcionando!
```

### Test 2: Login endpoint (sin auth)
```bash
curl -X POST https://proyecto-votaciones-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```
**Respuesta esperada:**
```json
{"message":"Email and password are required."}
```

---

## 📱 SIGUIENTE: DESPLEGAR FRONTEND

Una vez el backend esté corriendo:

### 1️⃣ Actualizar el frontend con URLs de Render

**En `client/.env` o variables de Render:**
```env
REACT_APP_API_URL=https://proyecto-votaciones-backend.onrender.com/api
```

### 2️⃣ En Render: Crear Static Site
- Click en **"New +"** → **"Static Site"**
- Selecciona **"ProyectoFinal-DW"**

### 3️⃣ Configura:
```
Name:              proyecto-votaciones-frontend
Region:            Oregon (US West)
Branch:            main-final
Build Command:     cd client && npm install && npm run build
Publish Directory: client/build
```

### 4️⃣ Agrega Environment:
```env
REACT_APP_API_URL=https://proyecto-votaciones-backend.onrender.com/api
```

### 5️⃣ Deploy
Click en **"Create Static Site"**

Esperaremos **3-5 minutos** para que esté listo.

---

## 🗄️ IMPORTAR ESQUEMA DE BD

Una vez el backend esté corriendo, necesitas cargar las tablas en PostgreSQL:

### Opción A: Usando Render Query (Más fácil)
1. Ve a tu BD en Render → **"Connect"**
2. Click en **"Query"**
3. Copia todo el contenido de `server/database/all.sql`
4. Pégalo en el editor de Query
5. Click en **"Execute"**

### Opción B: Usando psql (Línea de comandos)
```bash
# Primero instala psql si no lo tienes
# En Windows: choco install postgresql

psql "postgresql://votaciones_user:g3jY1mvVbUK3cudYR7CR3RLqZpWEFF00@dpg-d3u6flndiees73e136mg-a/votaciones_db_kutb" < server/database/all.sql
```

### Opción C: Usando el backend
El backend intenta crear tablas automáticamente si no existen. Pero es mejor crear el esquema correctamente con el archivo SQL.

---

## ✅ VERIFICACIÓN FINAL

Después de todo deployado:

1. **Backend corriendo:** `https://proyecto-votaciones-backend.onrender.com`
2. **Frontend corriendo:** `https://proyecto-votaciones-frontend.onrender.com`
3. **BD conectada:** Conectado a Render Postgres

Prueba el flujo completo:
1. Abre el frontend en el navegador
2. Intenta registrarte
3. Intenta loguearte
4. Navega por las campañas

---

## 🚨 SI ALGO SALE MAL

### Backend no inicia
- Ve a **Settings** → **Logs** en Render
- Busca líneas rojas con errores
- Verifica que `DATABASE_URL` sea exacta
- Asegúrate que `DB_SSL=true`

### Error de CORS
```json
{"error": "CORS policy: Origin not allowed"}
```
**Solución:** Actualiza `FRONTEND_URL` en las variables de Render del backend

### Tablas no existen
```
Error: relation "users" does not exist
```
**Solución:** Ejecuta `server/database/all.sql` en Render Query

### Conexión a BD rechazada
```
Error: connect ECONNREFUSED
```
**Solución:** 
- Verifica la URL en `DATABASE_URL`
- Comprueba que `DB_SSL=true`
- Espera a que Render termine de provisionar la BD

---

## 📊 RESUMEN DE URLs FINALES

Una vez todo esté en Render:

```
🌐 Frontend:      https://proyecto-votaciones-frontend.onrender.com
🔌 Backend API:   https://proyecto-votaciones-backend.onrender.com
📡 API Endpoints: https://proyecto-votaciones-backend.onrender.com/api
🗄️  Base de datos: PostgreSQL en Render (dpg-d3u6flndiees73e136mg-a)
```

---

## ⏱️ TIEMPO ESTIMADO

```
Backend:  5-10 min (primera compilación)
Frontend: 3-5 min (build React)
BD:       1-2 min (importar SQL)
─────────────────────────
TOTAL:    10-20 min 🎉
```

---

## 💡 TIPS ÚTILES

1. **Cold starts en plan Free:** Si no hay tráfico por 15 min, el servicio se pausa. La próxima solicitud tardará 30-50 seg.

2. **Ver logs en vivo:**
   - Backend: Render Dashboard → Service → Logs
   - Frontend: Render Dashboard → Site → Logs

3. **Redeploy manual:**
   - Si necesitas actualizar código, hace push a `main-final`
   - Render automáticamente hace redeploy
   - O click en **"Manual Deploy"** en Render

4. **Variables secretas:**
   - Nunca commitees `.env` con secrets reales
   - Usa `.env.example` como template
   - Los secrets se agregan en Render Dashboard

---

¡LISTO! 🚀 Sigue los pasos y tu aplicación estará en producción en menos de 20 minutos.

¿Necesitas ayuda con algún paso?
