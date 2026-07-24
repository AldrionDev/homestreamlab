import { randomUUID } from 'node:crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const TEST_EMAIL_PREFIX = 'e2e-';
const TEST_PASSWORD = 'TestPassw0rd!';

interface SafeUserResponseBody {
  id: string;
  email: string;
  displayName?: string;
}

interface RegisterResponseBody extends SafeUserResponseBody {
  createdAt: string;
  updatedAt: string;
}

interface LoginResponseBody {
  accessToken: string;
  user: SafeUserResponseBody;
}

function uniqueTestEmail(): string {
  return `${TEST_EMAIL_PREFIX}${randomUUID()}@homestreamlab.test`;
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService | undefined;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prismaService = app.get(PrismaService);
  });

  afterAll(async () => {
    if (prismaService) {
      await prismaService.user.deleteMany({
        where: { email: { startsWith: TEST_EMAIL_PREFIX } },
      });
    }

    if (app) {
      await app.close();
    }
  });

  async function registerTestUser(displayName = 'E2E Test User') {
    const email = uniqueTestEmail();

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: TEST_PASSWORD, displayName })
      .expect(201);

    return {
      email,
      password: TEST_PASSWORD,
      displayName,
      body: response.body as RegisterResponseBody,
    };
  }

  describe('POST /auth/register', () => {
    it('registers a new user and does not return passwordHash', async () => {
      const { email, displayName, body } = await registerTestUser('Alice');

      expect(body).toMatchObject({ email, displayName });
      expect(body.id).toEqual(expect.any(String));
      expect(body.createdAt).toBeDefined();
      expect(body.updatedAt).toBeDefined();
      expect(body).not.toHaveProperty('passwordHash');
    });

    it('returns 409 when registering a duplicate email', async () => {
      const { email } = await registerTestUser();

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: TEST_PASSWORD })
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('returns an accessToken for correct credentials', async () => {
      const { email, password } = await registerTestUser();

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(201);

      const body = response.body as LoginResponseBody;

      expect(body.accessToken).toEqual(expect.any(String));
      expect(body.user).toMatchObject({ email });
    });

    it('returns 401 for an incorrect password', async () => {
      const { email } = await registerTestUser();

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'wrong-password' })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    it('returns 401 with no token', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('returns the registered user data with a valid token', async () => {
      const { email, password, displayName } = await registerTestUser();

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(201);

      const { accessToken, user } = loginResponse.body as LoginResponseBody;

      const meResponse = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const meBody = meResponse.body as SafeUserResponseBody;

      expect(meBody).toEqual({
        id: user.id,
        email,
        displayName,
      });
      expect(meBody).not.toHaveProperty('passwordHash');
    });
  });
});
