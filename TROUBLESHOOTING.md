# 🔧 TROUBLESHOOTING - RENDER DEPLOYMENT

## ❌ Error: "connect ECONNREFUSED"

**Causa:** Backend no puede conectar a PostgreSQL

**Soluciones:**
1. Verifica que `DATABASE_URL` esté exacto:
   ```env
   postgresql://votaciones_user:g3jY1mvVbUK3cudYR7CR3RLqZpWEFF00@dpg-d3u6flndiees73e136mg-a/votaciones_db_kutb
   ```

2. Asegúrate que `DB_SSL=true` en variables de Render

3. Revisa los logs en Render:
   ```
   Settings → Logs → Busca líneas rojas
   ```

4. Espera a que Render termine de provisionar (2-3 min después de crear BD)

---

## ❌ Error: "CORS policy: Origin not allowed"

**Causa:** El frontend no está en la lista de orígenes permitidos

**Síntoma en console del navegador:**
```
Access to XMLHttpRequest at 'https://...' from origin 'https://...' 
has been blocked by CORS policy
```

**Solución:**
1. Ve a tu servicio Backend en Render
2. Settings → Environment
3. Actualiza `FRONTEND_URL` a tu URL real del frontend:
   ```env
   FRONTEND_URL=https://proyecto-votaciones-frontend.onrender.com
   ```
4. Click en "Save Changes" (se redeploya automáticamente)

---

## ❌ Error: "relation \"users\" does not exist"

**Causa:** Las tablas no están creadas en la BD

**Síntoma:**
```json
{
  "message": "Error en el servidor.",
  "detail": "relation \"users\" does not exist"
}
```

**Solución:**
1. Abre Render Dashboard
2. Selecciona tu BD → "Connect"
3. Click en "Query"
4. Abre `server/database/all.sql` en local
5. Copia TODO el contenido
6. Pégalo en el Query editor de Render
7. Click en "Execute"
8. Espera a que termine (debe mostrar queries ejecutadas)

**Alternativa con psql:**
```bash
psql "postgresql://votaciones_user:g3jY1mvVbUK3cudYR7CR3RLqZpWEFF00@dpg-d3u6flndiees73e136mg-a/votaciones_db_kutb" -f server/database/all.sql
```

---

## ❌ Error: "Password authentication failed"

**Causa:** Credenciales de BD son incorrectas

**Solución:**
1. Ve a Render Dashboard
2. Abre tu PostgreSQL instance
3. Click en "Info"
4. Copia el "Internal Database URL"
5. Pégalo exacto en la variable `DATABASE_URL`

**Formato correcto:**
```
postgresql://votaciones_user:PASSWORD@HOST/votaciones_db_kutb
```

No copies el `postgres://`, asegúrate que sea `postgresql://`

---

## ❌ Error: "Port already in use"

**Causa:** Render ya tiene un proceso en el puerto

**Solución:**
1. Ve a tu servicio Backend en Render
2. Settings → Advanced
3. Click en "Manual Deploy"
4. Espera a que redeploy

O usa el `PORT` dinámico de Render (el servidor ya lo hace):
```javascript
const PORT = process.env.PORT || 5000;
```

---

## ❌ Error 404 en endpoints

**Causa:** Rutas no están configuradas correctamente

**Síntoma:**
```
GET https://backend.onrender.com/api/auth/login → 404 Not Found
```

**Solución:**
1. Verifica que el Build Command esté correcto:
   ```
   npm install && npm install -g nodemon
   ```

2. Verifica el Start Command:
   ```
   cd server && node index.js
   ```

3. Asegúrate que `server/index.js` exporte las rutas:
   ```javascript
   app.use('/api/auth', createAuthRoutes(pool));
   ```

4. Revisa los logs para ver si el servidor inició

---

## ⚠️ Advertencia: "Service is running but..."

**Backend corriendo pero frontend no conecta**

**Checklist:**
- [ ] ¿El frontend tiene la URL correcta del backend?
- [ ] ¿El CORS está configurado correctamente?
- [ ] ¿Las credenciales de BD son correctas?
- [ ] ¿El archivo `all.sql` fue ejecutado?

**Prueba rápida:**
```bash
curl -i https://proyecto-votaciones-backend.onrender.com
# Debe retornar: HTTP/1.1 200 OK
```

---

## 🐢 Slow Performance (Cold Start)

**Problema:** Primera solicitud tarda 30-50 segundos

**Causa:** Plan Free de Render pausa servicios después de 15 min sin uso

**Soluciones:**
1. **Aceptar:** Es normal en plan Free 👍

2. **Upgrade:** Cambiar a plan pagado
   - Settings → Plan → Cambiar a "Standard" ($12/mes)

3. **Mantener vivo:** Hacer ping cada 10 minutos desde afuera
   ```bash
   # (Requiere servicio externo como UptimeRobot)
   ```

---

## 🔍 Debug Avanzado

### Ver logs en tiempo real:
```bash
# En Render Dashboard, servicio Backend:
Settings → Logs → Busca líneas específicas
```

### Conectar a BD directamente para ver datos:

**Con psql:**
```bash
psql "postgresql://votaciones_user:g3jY1mvVbUK3cudYR7CR3RLqZpWEFF00@dpg-d3u6flndiees73e136mg-a/votaciones_db_kutb"

# Comandos útiles:
\dt                    # Ver todas las tablas
SELECT * FROM users;   # Ver usuarios
SELECT * FROM campaigns; # Ver campañas
\q                     # Salir
```

### Verificar variables de entorno en Render:

```bash
# En Render, Settings → Environment
# Copia exactamente (sin espacios extras)
```

---

## 🆘 Si todo falla

**Resetear y empezar de nuevo:**

1. **Borrar el Backend en Render:**
   - Dashboard → Tu servicio → Settings → Scroll hasta abajo → "Delete Service"

2. **Crear de nuevo:**
   - Sigue exactamente los pasos de `RENDER_STEPS.md`

3. **Verificar credenciales:**
   - BD PostgreSQL → "Info"
   - Copiar "Internal Database URL" exacto
   - Pegar en `DATABASE_URL`

4. **Redeploy:**
   - Click en "Manual Deploy"

---

## 📞 Contacto / Soporte

Si el error persiste:

1. **Leer logs completos:**
   - Render Dashboard → Logs → buscar líneas con "ERROR"

2. **Verificar conexión:**
   ```bash
   curl -i https://proyecto-votaciones-backend.onrender.com
   ```

3. **Testar BD:**
   ```bash
   psql "postgresql://votaciones_user:PASSWORD@HOST/DB"
   SELECT 1;
   ```

4. **Documentación:**
   - https://render.com/docs
   - https://www.postgresql.org/docs/

---

## ✅ Checklist Final

- [ ] Backend deployado en Render ✓
- [ ] Logs sin errores en rojo ✓
- [ ] Ping a `/` devuelve 200 ✓
- [ ] BD tablas creadas con `all.sql` ✓
- [ ] CORS configurado (FRONTEND_URL correcta) ✓
- [ ] Frontend puede conectar a API ✓
- [ ] Login/Register funcionan end-to-end ✓

Si todos los checks pasan: **¡LISTO PARA PRODUCCIÓN!** 🎉🗳️
