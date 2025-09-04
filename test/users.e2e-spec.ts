import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateUserDto } from '../src/modules/users/presentation/dto/create-user.dto';
import { PrismaService } from '../src/core/infrastructure/prisma/prisma.service';

describe('UsersController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let createdUserId: string;
    const testUser: CreateUserDto = {
        email: 'test@example.com',
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User'
    };

    beforeAll(async () => {
        console.log('🚀 Starting Users E2E Tests');
        console.log('⚙️ Setting up test environment...');

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = app.get<PrismaService>(PrismaService);

        // Clean database before tests
        console.log('🧹 Cleaning test database...');
        await prisma.user.deleteMany();

        await app.init();
        console.log('✅ Test environment is ready');
    });

    afterAll(async () => {
        console.log('🧹 Cleaning up test environment...');
        await prisma.user.deleteMany();
        await prisma.$disconnect();
        await app.close();
        console.log('✅ Test environment cleaned up');
    });

    describe('POST /users', () => {
        it('should create a new user', async () => {
            console.log('📝 Testing user creation...');
            console.log('Input:', JSON.stringify(testUser, null, 2));

            const response = await request(app.getHttpServer())
                .post('/users')
                .send(testUser)
                .expect(201);

            console.log('Response:', JSON.stringify(response.body, null, 2));
            expect(response.body.id).toBeDefined();
            createdUserId = response.body.id;
            console.log('✅ User created successfully with ID:', createdUserId);
        });

        it('should not create user with duplicate email', async () => {
            console.log('🔄 Testing duplicate email prevention...');
            console.log('Attempting to create user with email:', testUser.email);

            const response = await request(app.getHttpServer())
                .post('/users')
                .send(testUser)
                .expect(409);

            console.log('Expected conflict response:', JSON.stringify(response.body, null, 2));
        });
    });

    describe('GET /users/:id', () => {
        it('should get user by id', async () => {
            console.log('🔍 Testing get user by ID...');
            console.log('Looking up user with ID:', createdUserId);

            const response = await request(app.getHttpServer())
                .get('/users/' + createdUserId)
                .expect(200);

            console.log('Retrieved user:', JSON.stringify(response.body, null, 2));
            expect(response.body.email).toBe(testUser.email);
            expect(response.body.firstName).toBe(testUser.firstName);
            expect(response.body.lastName).toBe(testUser.lastName);
            expect(response.body.passwordHash).toBeUndefined();
        });

        it('should return 404 for non-existent user', async () => {
            const nonExistentId = '123456789012345678901234';
            console.log('🔍 Testing non-existent user lookup...');
            console.log('Attempting to find user with ID:', nonExistentId);

            const response = await request(app.getHttpServer())
                .get('/users/' + nonExistentId)
                .expect(404);

            console.log('Expected not found response:', JSON.stringify(response.body, null, 2));
        });
    });

    describe('GET /users', () => {
        it('should get all users', async () => {
            console.log('📋 Testing get all users...');

            const response = await request(app.getHttpServer())
                .get('/users')
                .expect(200);

            console.log('Retrieved ' + response.body.length + ' users:');
            console.log(JSON.stringify(response.body, null, 2));
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });
    });

    describe('PUT /users/:id', () => {
        it('should update user', async () => {
            const updateData = {
                firstName: 'Updated',
                lastName: 'Name'
            };
            console.log('✏️ Testing user update...');
            console.log('Updating user ID:', createdUserId);
            console.log('Update data:', JSON.stringify(updateData, null, 2));

            const response = await request(app.getHttpServer())
                .put('/users/' + createdUserId)
                .send(updateData)
                .expect(200);

            console.log('Update response:', JSON.stringify(response.body, null, 2));

            // Verify the update
            const updatedUser = await request(app.getHttpServer())
                .get('/users/' + createdUserId)
                .expect(200);

            console.log('Retrieved updated user:', JSON.stringify(updatedUser.body, null, 2));
            expect(updatedUser.body.firstName).toBe(updateData.firstName);
            expect(updatedUser.body.lastName).toBe(updateData.lastName);
        });

        it('should return 404 when updating non-existent user', async () => {
            const nonExistentId = '123456789012345678901234';
            console.log('✏️ Testing update of non-existent user...');
            console.log('Attempting to update user with ID:', nonExistentId);

            const response = await request(app.getHttpServer())
                .put('/users/' + nonExistentId)
                .send({ firstName: 'Test' })
                .expect(404);

            console.log('Expected not found response:', JSON.stringify(response.body, null, 2));
        });
    });

    describe('DELETE /users/:id', () => {
        it('should delete user', async () => {
            console.log('🗑️ Testing user deletion...');
            console.log('Deleting user with ID:', createdUserId);

            await request(app.getHttpServer())
                .delete('/users/' + createdUserId)
                .expect(200);

            console.log('User deleted successfully');

            // Verify deletion
            console.log('Verifying user deletion...');
            await request(app.getHttpServer())
                .get('/users/' + createdUserId)
                .expect(404);

            console.log('✅ Verified: User no longer exists');
        });

        it('should return 404 when deleting non-existent user', async () => {
            const nonExistentId = '123456789012345678901234';
            console.log('🗑️ Testing deletion of non-existent user...');
            console.log('Attempting to delete user with ID:', nonExistentId);

            const response = await request(app.getHttpServer())
                .delete('/users/' + nonExistentId)
                .expect(404);

            console.log('Expected not found response:', JSON.stringify(response.body, null, 2));
        });
    });
});
