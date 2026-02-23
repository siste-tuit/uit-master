/**
 * Crea la base de datos uit si no existe.
 * Ejecutar desde la carpeta server: node crearBaseDeDatos.js
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config();

async function main() {
  const host = process.env.DB_HOST || "localhost";
  const port = parseInt(process.env.DB_PORT || "3306", 10);
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASS || "";
  const database = process.env.DB_NAME || "uit";

  console.log("Conectando a MySQL (sin base de datos)...");
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
  });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
  console.log(`Base de datos "${database}" lista.`);
  await conn.end();
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
