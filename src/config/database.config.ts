import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/users.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'db.sqlite',
  entities: [User],
  synchronize: true,
};
