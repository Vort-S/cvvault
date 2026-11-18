import 'server-only';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
// Neon HTTP + Drizzle bind all data parameters; never concatenate SQL from user input.
export function getDb(){
  if(!process.env.DATABASE_URL) throw new Error('Database unavailable');
  if(!process.env.DATABASE_URL.includes('sslmode=require')) throw new Error('Database URL must require SSL');
  return drizzle(neon(process.env.DATABASE_URL),{schema});
}
