import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from '../../src/app.module';
import { SeedHelper } from '../../test/helpers/seed.helper';
import { dataSource } from '../config/database.config';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let seedHelper: SeedHelper;
  let token: string;
  let refreshToken: string;
  let username: string;
  let password: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule.withTypeOrm(dataSource.options)],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    seedHelper = new SeedHelper(dataSource);

    // Seed initial data
    await seedHelper.initialize();
    username = uuidv4();
    password = 'password';
    await seedHelper.createUser(username, password);

    // Obtain a valid token for the tests
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username, password });

    token = loginResponse.body.accessToken;
    refreshToken = loginResponse.body.refreshToken;
  });

  afterAll(async () => {
    await seedHelper.clearUsers();
    await seedHelper.destroy();
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    const registerDto = {
      username: uuidv4(),
      password: 'password',
    };
    it('[SMOKE] should register a new user', async () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED)
        .then((res) => {
          expect(res.body).toHaveProperty('username', registerDto.username);
        });
    });

    it('[SMOKE] should return conflict for duplicate username', async () => {
      const wrongRegisterDto = {
        username: registerDto.username,
        password: 'password',
      };
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(wrongRegisterDto)
        .expect(HttpStatus.CONFLICT)
        .then((res) => {
          expect(res.body.message).toBe('Username already exists');
        });
    });

    it('[SMOKE] should return bad request for invalid data', async () => {
      const wrongRegisterDto = {
        username: '',
        password: 'short',
      };
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(wrongRegisterDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/auth/login (POST)', () => {
    it('[SMOKE] should login and return tokens', async () => {
      const loginDto = {
        username,
        password,
      };
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(HttpStatus.OK)
        .then((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('username', username);
        });
    });

    it('[SMOKE] should return unauthorized for invalid credentials', async () => {
      const loginDto = {
        username: 'testuserbakakak',
        password: 'wrongpassword',
      };
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(HttpStatus.UNAUTHORIZED)
        .then((res) => {
          expect(res.body.message).toBe('Invalid credentials');
        });
    });

    it('[SMOKE] should return bad request for missing credentials', async () => {
      const loginDto = {
        username: '',
        password: '',
      };
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('[SMOKE] should refresh tokens successfully', async () => {
      const refreshDto = { refreshToken };
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send(refreshDto)
        .expect(HttpStatus.OK)
        .then((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('[SMOKE] should return unauthorized with invalid refresh token', async () => {
      const refreshDto = { refreshToken: 'invalidtoken' };
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send(refreshDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('[SMOKE] should return bad request with missing refresh token', async () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/auth/logout (POST)', () => {
    it('[SMOKE] should logout successfully', async () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NO_CONTENT);
    });

    it('[SMOKE] should return unauthorized with no token', async () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('[SMOKE] should return unauthorized with invalid token', async () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
