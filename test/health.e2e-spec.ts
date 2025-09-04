import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/core/infrastructure/prisma/prisma.service';

describe('HealthController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = app.get<PrismaService>(PrismaService);

        // Clean database before tests
        await prisma.user.deleteMany();

        await app.init();
    });

    afterAll(async () => {
        await prisma.user.deleteMany();
        await prisma.$disconnect();
        await app.close();
    });

    it('/health (GET)', async () => {
        const res = await request(app.getHttpServer())
            .get('/health')
            .expect(200);
        expect(res.body).toEqual({ status: 'ok' });
    });
});
