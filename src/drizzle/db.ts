import { env } from '@/data/env/server';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema" /* makes sure drizzle knows what our schema looks like */

const sql = neon(env.DATABASE_URL); /* if you don't invclude you will get an error */
export const db = drizzle(sql, { schema, logger: true }); /* export so it gives access to database */

