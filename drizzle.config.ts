//finish set up for drizzle 
import { env } from "@/data/env/server"
import type { Config } from 'drizzle-kit'; /* seems to be changes to documentation */

export default {
  schema: './src/drizzle/schema.ts', /* all schema is located here */
  out: './src/drizzle/migrations', /* all migrations */
  dialect: 'postgresql', 
  strict: true, /* extra warnings */
  verbose: true, /* validation */
  dbCredentials: {
    url: env.DATABASE_URL, /* credentials */
  },
};