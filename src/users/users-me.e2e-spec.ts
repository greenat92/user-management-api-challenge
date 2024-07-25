import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from '../../src/app.module';
import { SeedHelper } from '../../test/helpers/seed.helper';
import { dataSource } from '../config/database.config';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let seedHelper: SeedHelper;
  let token: string;
  let username: string;
  let password: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule.withTypeOrm(dataSource.options)],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Apply global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    seedHelper = new SeedHelper(dataSource);

    // Seed initial data
    await seedHelper.initialize();
    username = uuidv4();
    password = `password`;
    await seedHelper.createUser(username, password);

    // Obtain a valid token for the tests
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username, password });
    token = response.body.refreshToken;
  });

  describe('/users/me (GET)', () => {
    it('[SMOKE] should return user profile', async () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);
    });

    it('[SMOKE] should return unauthorized with wrong token', async () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer wrongtoken')
        .expect(HttpStatus.UNAUTHORIZED)
        .then((res) => {
          expect(res.body.message).toBe('Unauthorized');
        });
    });

    it('[SMOKE] should return unauthorized with no token', async () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .expect(HttpStatus.UNAUTHORIZED)
        .then((res) => {
          expect(res.body.message).toBe('Unauthorized');
        });
    });
  });

  describe('/users/me (PATCH)', () => {
    it('[SMOKE] should return succes request with invalid data', async () => {
      const updateData = {
        newUsername: uuidv4(),
        oldPassword: 'password',
        newPassword: 'newpassword',
      };
      return request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(HttpStatus.OK);
    });

    it('[SMOKE] should return bad request with incorrect old password', async () => {
      const invalidUpdateData = {
        newUsername: uuidv4(),
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword',
      };
      return request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidUpdateData)
        .expect(HttpStatus.CONFLICT);
    });

    it('[SMOKE] should return unauthorized with no token', async () => {
      const updateData = {
        newUsername: uuidv4(),
        oldPassword: 'password',
        newPassword: 'newpassword',
      };
      return request(app.getHttpServer())
        .patch('/users/me')
        .send(updateData)
        .expect(HttpStatus.UNAUTHORIZED)
        .then((res) => {
          expect(res.body.message).toBe('Unauthorized');
        });
    });
  });

  afterAll(async () => {
    await seedHelper.clearUsers();
    await seedHelper.destroy();
    await app.close();
  });
});
