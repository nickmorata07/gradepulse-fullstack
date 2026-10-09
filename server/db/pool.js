import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing. Copy server/.env.example to server/.env and configure PostgreSQL.')
  process.exit(1)
}
const isLocal = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 8,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
})
pool.on('error', (error) => console.error('Unexpected PostgreSQL pool error:', error.message))
