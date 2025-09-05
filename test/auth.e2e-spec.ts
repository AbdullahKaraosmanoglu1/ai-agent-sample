import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/infrastructure/prisma/prisma.service';
import { cleanDatabase } from './helpers/database-cleaner';

describe('Authentication (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let accessToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = app.get<PrismaService>(PrismaService);
        
        // Clean database before tests
        await cleanDatabase(prisma);
        
        await app.init();
    });

    it('should register -> login -> access protected route', async () => {
        // 1. Register a test user
        const registerResponse = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: 'test@example.com',
                password: 'Test123!',
                firstName: 'Test',
                lastName: 'User'
            });
        expect(registerResponse.status).toBe(201);

        // 2. Login to get tokens
        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: 'test@example.com',
                password: 'Test123!'
            });
        expect(loginResponse.status).toBe(201);
        expect(loginResponse.body.accessToken).toBeDefined();
        accessToken = loginResponse.body.accessToken;

        // 3. Try protected route without token (should fail)
        const unauthorizedResponse = await request(app.getHttpServer())
            .get('/users');
        expect(unauthorizedResponse.status).toBe(401);

        // 4. Try protected route with token (should succeed)
        const authorizedResponse = await request(app.getHttpServer())
            .get('/users')
            .set('Authorization', `Bearer ${accessToken}`);
        expect(authorizedResponse.status).toBe(200);
    });

    afterAll(async () => {
        await cleanDatabase(prisma);
        await prisma.$disconnect();
        await app.close();
    });
});
