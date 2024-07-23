import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'db.sqlite',
  entities: [__dirname + '/../../**/*.entity.{js,ts}'],
  synchronize: process.env.APP_ENV !== 'production',
  logging: process.env.APP_ENV !== 'production',
};
