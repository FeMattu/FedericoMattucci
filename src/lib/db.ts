import { neon } from '@neondatabase/serverless';
import { Pool } from 'pg';

// Connessione diretta con neon per query SQL raw
export const sql = neon(process.env.DATABASE_URL!);

// Pool di connessione per operazioni che richiedono transazioni più complesse
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(query, params);
    return rows as T[];
  } finally {
    client.release();
  }
}

// Esempio di funzione per eseguire una query
export async function getProjects() {
  return executeQuery('SELECT * FROM "Project" ORDER BY "order" DESC');
}

// Connessione con sql tagged template literals per query più semplici
export async function getProjectBySlug(slug: string) {
  return sql`SELECT * FROM "Project" WHERE slug = ${slug} LIMIT 1`;
}

// Crea un oggetto con tutte le funzioni esportate
const dbClient = { sql, executeQuery, getProjects, getProjectBySlug };

export default dbClient;
