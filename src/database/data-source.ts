import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DB_NAME || 'db.sqlite',
  entities: [__dirname + '/../../**/*.entity.{js,ts}'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: process.env.APP_ENV !== 'production',
  logging: process.env.APP_ENV !== 'production', // Set to true only for development
});
