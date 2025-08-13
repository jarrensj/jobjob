import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

async function main() {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is not defined')
    }
    
    const client = postgres(connectionString, { prepare: false })
    const db = drizzle(client);
}

main();
