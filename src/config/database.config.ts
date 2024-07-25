import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../users/user.entity'; // Import the User entity directly

export const typeOrmConfig: DataSourceOptions = {
  type: 'sqlite',
  database:
    process.env.APP_ENV === 'test'
      ? 'test_db.sqlite'
      : process.env.DB_NAME || 'db.sqlite',
  entities: [User],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: process.env.APP_ENV !== 'production',
  logging: process.env.APP_ENV !== 'production',
};

export const dataSource = new DataSource(typeOrmConfig);
