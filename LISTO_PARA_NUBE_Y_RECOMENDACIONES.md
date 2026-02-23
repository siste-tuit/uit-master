# ¿Listo para subir a la nube? Checklist y recomendaciones

## ✅ ¿Hay que hacer algún cambio antes?

En principio **no hace falta cambiar código** para subir a la nube. El proyecto ya está preparado para producción. Solo debes:

1. **Crear una base de datos MySQL en la nube** (nueva, porque la de Railway anterior no tiene contraseña recuperable).
2. **Configurar variables de entorno** en el servicio donde despliegues el backend.
3. **Ejecutar migraciones y seeders** contra esa base (desde el Shell del backend o desde tu PC apuntando a la nueva BD).
4. **Desplegar el frontend** como sitio estático y que apunte a la URL del backend.

No hay cambios obligatorios en el código; todo se controla con variables de entorno y pasos de despliegue.

---

## 🧪 Prueba de estrés

Hay un script en `server/stress-test.js` que hace muchas peticiones concurrentes al backend (health + login) y muestra cuántas responden OK y los tiempos (avg, min, max).

### Cómo ejecutarla

**Con el backend en local (puerto 5000):**

```bash
cd server
node stress-test.js http://localhost:5000
```

**Contra el backend en la nube (ejemplo):**

```bash
cd server
node stress-test.js https://uit-backend.onrender.com
```

Interpretación rápida:

- Si **todas las peticiones son OK** y los tiempos son razonables (p. ej. avg &lt; 2000 ms en nube), el backend aguanta bien la carga de prueba.
- Si hay **muchos fallos** o tiempos muy altos, conviene revisar límites del plan (Render/Railway), cold starts o conexión a la BD.

---

## ☁️ Recomendación de nube según las características del sistema

Tu stack: **React (Vite) + Express + MySQL**. Es un ERP interno, tráfico moderado, necesidad de BD relacional y JWT.

### Opción recomendada (la que ya tienes documentada)

| Componente   | Servicio   | Motivo |
|-------------|------------|--------|
| **Backend** | **Render** | Fácil deploy desde Git, variables de entorno, Shell para migraciones. Plan free con cold start; de pago sin cold start. |
| **Base de datos** | **Railway** (MySQL) o **JawsDB** | MySQL gestionado, precio bajo. Creas un **nuevo** MySQL (no el que perdiste) y guardas bien la contraseña. |
| **Frontend** | **Render (Static Site)** o **Vercel** | Subes la carpeta `frontend`, build: `cd frontend && npm install && npm run build`, directorio de publicación: `frontend/dist`. |

Ventajas de esta combinación:

- Toda la documentación del repo (Render, Railway, JawsDB) encaja con este esquema.
- Un solo lugar (Render) para backend + frontend si quieres, o Vercel solo para el frontend si prefieres.
- MySQL en Railway/JawsDB es barato y suficiente para un ERP interno.

### Alternativas igualmente válidas

- **Backend:** Railway (Web Service) o Fly.io.
- **BD:** PlanetScale (MySQL compatible), JawsDB, o el MySQL de Railway.
- **Frontend:** Vercel, Netlify o Cloudflare Pages (todos sirven para un build estático de Vite).

### Resumen de recomendación

- **Para no complicarte y seguir tus guías:** **Render (backend + static frontend) + Railway (nuevo MySQL)**. Creas el nuevo MySQL en Railway, copias las variables a Render, ejecutas migraciones y seeders, y despliegas el frontend en Render como Static Site con `VITE_API_URL` apuntando a tu backend.
- **Si quieres frontend muy rápido y gratis:** Frontend en **Vercel** y backend en Render; el resto igual.

No hace falta cambiar código; solo elegir proveedor, crear la BD nueva, configurar env y desplegar.

---

## 💰 Opciones más económicas (y hasta gratis)

Sí hay alternativas **más baratas o gratuitas**; el trade-off suele ser límites de uso, “cold starts” o menos recursos.

### Resumen rápido

| Componente | Más económico / gratis | Coste aproximado | Limitación principal |
|------------|------------------------|-------------------|------------------------|
| **Backend** | Render (free) | **$0** | Se duerme a los ~15 min sin uso; primera petición tarda ~1 min (cold start). |
| **Backend** | Railway (free) | **$0** (≈ $1 crédito/mes) | El crédito se gasta rápido con backend + MySQL; suele pasar a unos pocos $/mes. |
| **Backend** | Fly.io (free tier) | **$0** (con límites) | VM pequeña gratis; suficiente para tráfico bajo. |
| **Base de datos** | JawsDB Kitefin | **$0** | Solo **5 MB** y ~10 conexiones; sirve para pruebas o datos muy pocos. |
| **Base de datos** | Railway MySQL | **~$0–5/mes** | Pago por uso; MySQL consume bastante RAM, el free ($1/mes) suele quedarse corto. |
| **Base de datos** | JawsDB Leopard | **~10 USD/mes** | 1 GB, más conexiones; estable para un ERP pequeño. |
| **Frontend** | Vercel / Netlify / Cloudflare Pages | **$0** | Sin límite relevante para un ERP interno (sitio estático). |

### Combinaciones posibles

**1. Lo más barato (casi todo gratis, con límites)**  
- **Backend:** Render (plan free).  
- **BD:** JawsDB **Kitefin** (gratis, 5 MB). Solo si tu volumen de datos es muy bajo (pocas tablas, poco historial).  
- **Frontend:** Vercel o Cloudflare Pages (gratis).  
- **Inconveniente:** Cold start del backend en Render; BD muy limitada.

**2. Barato y más usable para un ERP**  
- **Backend:** Render (free) o Fly.io (free tier).  
- **BD:** Railway MySQL (nuevo servicio). Suele ser **unos 2–5 USD/mes** según uso; estable y suficiente.  
- **Frontend:** Vercel o Netlify (gratis).  
- **Ventaja:** Tu documentación (Render + Railway) encaja; buen equilibrio precio/estabilidad.

**3. Solo frontend gratis (backend y BD de pago)**  
- **Backend:** Render (plan de pago) o Railway.  
- **BD:** Railway MySQL o JawsDB Leopard (~10 USD/mes).  
- **Frontend:** Cualquier estático gratis (Vercel, etc.).  
- **Ventaja:** Sin cold start, más estable para uso diario.

### Conclusión

- **Sí hay opciones más económicas:** backend y frontend pueden ser **gratis** (Render free + Vercel/Netlify/Cloudflare).  
- **El “cuello de botella” es MySQL:** lo realmente gratis y compatible con tu código es JawsDB Kitefin (5 MB); si tu ERP crece un poco, en la práctica necesitas algo de pago (Railway o JawsDB de pago).  
- **Recomendación para tu caso (ERP interno):** **Render free + Railway MySQL (pocos USD/mes) + frontend en Vercel/Cloudflare** suele ser la opción más económica y que mejor se lleva con tus guías actuales.
