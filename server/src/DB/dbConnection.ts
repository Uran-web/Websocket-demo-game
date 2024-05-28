import { Pool } from "pg";
import "dotenv/config";

// NOTE: make db port as number
const db_port = process.env.DB_PORT ? +process.env.DB_PORT : 5432;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: db_port,
});

export default pool;
