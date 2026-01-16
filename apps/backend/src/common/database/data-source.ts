import 'reflect-metadata';
import * as path from 'node:path';
import { config as loadEnv, DotenvConfigOptions } from 'dotenv';
import { DataSource } from 'typeorm';

const isProd = process.env.NODE_ENV === 'production';
const envFile = isProd ? '.env.production.local' : '.env.development.local';
const loadEnvSafe = loadEnv as (options?: DotenvConfigOptions) => void;
loadEnvSafe({ path: envFile });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [path.join(__dirname, '..', '..', '**', '*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: !isProd,
});
