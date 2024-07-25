import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { typeOrmConfig } from './config/database.config';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule.withTypeOrm(typeOrmConfig)],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('[SMOKE] / (GET)', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(HttpStatus.OK)
      .expect(Object);
  });
});
