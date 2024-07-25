import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { dataSource } from './config/database.config';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule.withTypeOrm(dataSource.options)],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('[SMOKE] /api (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(HttpStatus.OK);
  });

  afterAll(async () => {
    await app.close();
  });
});
