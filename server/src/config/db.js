
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Cargar primero .env.local de la raíz (desarrollo local); luego server/.env si existe
dotenv.config({ path: path.resolve(__dirname, "../../../.env.local"), override: false });
dotenv.config();

const sslOptions = process.env.DB_SSL === 'true'
    ? {
          ssl: {
              rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
          }
      }
    : {};

const baseOptions = {
    waitForConnections: true,
    connectionLimit: 10,
    multipleStatements: true,
    connectTimeout: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    ...sslOptions
};

export const pool = process.env.DB_URL
    ? mysql.createPool({
          uri: process.env.DB_URL,
          ...baseOptions
      })
    : mysql.createPool({
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT || '3306'),
          user: process.env.DB_USER,
          password: process.env.DB_PASS,
          database: process.env.DB_NAME,
          ...baseOptions
      });

export default pool;
