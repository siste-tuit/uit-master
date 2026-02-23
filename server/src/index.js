import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { pool } from "./config/db.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import roleRoutes from "./routes/roles.js";
import departamentRoutes from "./routes/departament.js";
import configRoutes from "./routes/config.js";
import logRoutes from "./routes/log.js";
import configuracionFacturasRoutes from "./routes/configuracionFacturas.js"; // NUEVO
import equiposRoutes from "./routes/equipos.js";
import ordenesRoutes from "./routes/ordenes.js";
import repuestosRoutes from "./routes/repuestos.js";
import calendarioRoutes from "./routes/calendario.js";
import produccionRoutes from "./routes/produccion.js";
import inventarioRoutes from "./routes/inventario.js";
import contabilidadRoutes from "./routes/contabilidad.js";
import incidenciasRoutes from "./routes/incidencias.js";
import reportesProduccionRoutes from "./routes/reportesProduccion.js";
import flujosSalidaRoutes from "./routes/flujosSalida.js";
import flujosIngresoRoutes from "./routes/flujosIngreso.js";
import trabajadoresRoutes from "./routes/trabajadores.js";
import asistenciaRoutes from "./routes/asistencia.js";

dotenv.config();

const app = express();

// CORS: permitir frontend en producción (Render) y desarrollo local
const allowedOrigins = [
    "https://uit-frontend.onrender.com",
    "https://uit-master2026.onrender.com",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001"
];
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Ping de prueba (opcional)
app.get("/ping", async (req, res) => {
    const [rows] = await pool.query("SELECT NOW() as now");
    res.json(rows[0]);
});

// Health check liviano (no depende de la BD)
app.get("/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
});

// 🔐 Rutas de autenticación
app.use("/api/auth", authRoutes);
// Rutas de Usuario
app.use("/api/users", userRoutes);
// 🏷️ Rutas de Gestión de Roles
app.use("/api/roles", roleRoutes);
// 🏷️ Rutas de Gestión de Roles
app.use("/api/departamentos", departamentRoutes);
// 🏷️ Rutas de Gestión de Roles
app.use("/api/configuracion", configRoutes);
// ⚙️ Rutas de Configuración de Facturas
app.use("/api/configuracion/facturas", configuracionFacturasRoutes); // NUEVO
// 🏷️ Rutas de Gestión de Roles
app.use("/api/logs", logRoutes);
// 🏷️ Rutas de Gestión de Roles
app.use("/api/equipos", equiposRoutes);
// 🏷️ Rutas de Gestión de Roles
app.use("/api/ordenes", ordenesRoutes);
// 🏷️ Rutas de Gestión de Roles
app.use("/api/repuestos", repuestosRoutes);
// 🏷️ Rutas de Gestión de Roles
app.use("/api/calendario", calendarioRoutes);
// 📊 Rutas de Producción
app.use("/api/produccion", produccionRoutes);
// 📋 Rutas de Reportes de Producción
app.use("/api/reportes-produccion", reportesProduccionRoutes);
// 📦 Rutas de Inventario
app.use("/api/inventario", inventarioRoutes);
// 💰 Rutas de Contabilidad
app.use("/api/contabilidad", contabilidadRoutes);
// 🐛 Rutas de Incidencias
app.use("/api/incidencias", incidenciasRoutes);
// 📥 Rutas de Flujos de Salida
app.use("/api/flujos-salida", flujosSalidaRoutes);
// 📤 Rutas de Flujos de Ingreso
app.use("/api/flujos-ingreso", flujosIngresoRoutes);
// 👥 Rutas de Trabajadores
app.use("/api/trabajadores", trabajadoresRoutes);
// ⏰ Rutas de Asistencia
app.use("/api/asistencia", asistenciaRoutes);

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
