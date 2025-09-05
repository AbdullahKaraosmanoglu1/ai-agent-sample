# API Documentation

## OpenAPI/Swagger Integration

This API is documented using OpenAPI 3.0 (formerly known as Swagger) specification. The documentation is automatically generated and kept in sync with the codebase.

### Features
- Interactive API documentation
- Built-in API testing interface
- Authentication integration
- Request/Response examples
- Schema validation
- API versioning support

### Accessing Documentation
The Swagger UI is available at `/api` when the application is running:
```
http://localhost:3000/api
```

### Authentication in Swagger UI
1. Click the "Authorize" button at the top
2. Enter your Bearer token (received from /auth/login)
3. All subsequent requests will include the token

## Authentication

### Overview
The API uses JWT (JSON Web Token) based authentication with both access tokens and refresh tokens. Access tokens are short-lived (15 minutes) while refresh tokens have a longer lifespan (14 days).

### Authentication Endpoints

#### Register
```http
POST /auth/register
```

Create a new user account.

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "YourSecurePassword123!",
    "firstName": "John",
    "lastName": "Doe"
}
```

**Response:** `201 Created`
```json
{
    "id": "user_id"
}
```

#### Login
```http
POST /auth/login
```

Authenticate user and receive tokens.

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "YourSecurePassword123!"
}
```

**Response:** `201 Created`
```json
{
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
}
```

#### Refresh Token
```http
POST /auth/refresh
```

Get new tokens using refresh token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "refreshToken": "your_refresh_token"
}
```

**Response:** `200 OK`
```json
{
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token"
}
```

#### Logout
```http
POST /auth/logout
```

Invalidate refresh token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "refreshToken": "your_refresh_token"
}
```

**Response:** `200 OK`

#### Get Current User
```http
GET /auth/me
```

Get current user information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
}
```

## Protected Endpoints

### Users

#### Get All Users
```http
GET /users
```

**Headers:**
```
Authorization: Bearer <access_token>
```

#### Get User by ID
```http
GET /users/:id
```

**Headers:**
```
Authorization: Bearer <access_token>
```

#### Update User
```http
PUT /users/:id
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "firstName": "Updated",
    "lastName": "Name"
}
```

#### Delete User
```http
DELETE /users/:id
```

**Headers:**
```
Authorization: Bearer <access_token>
```

## Error Responses

### Common Error Status Codes

- `400 Bad Request` - Invalid request body or parameters
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Valid token but insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists (e.g., email during registration)
- `500 Internal Server Error` - Server error

### Error Response Format
```json
{
    "statusCode": 400,
    "message": "Error message here",
    "error": "Error type"
}
```

## Security Considerations

1. All passwords are hashed using bcrypt before storage
2. Access tokens expire after 15 minutes
3. Refresh tokens are valid for 14 days
4. All protected endpoints require a valid access token
5. Refresh tokens are single-use and are rotated on refresh
6. Token revocation is supported through logout endpoint

## API Documentation with Swagger/OpenAPI

### Setup and Configuration

1. Install required packages:
```bash
npm install @nestjs/swagger swagger-ui-express
```

2. Update `main.ts` to configure Swagger:
```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API documentation for the authentication and user management system')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('users')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token', // This name here is important for references
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(3000);
}
```

3. Decorate DTOs with Swagger properties:
```typescript
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  email: string;

  @ApiProperty({
    example: 'YourSecurePassword123!',
    description: 'The password for authentication',
  })
  password: string;
}
```

4. Decorate controllers with Swagger metadata:
```typescript
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ 
    status: 201, 
    description: 'Login successful',
    type: AuthResultDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials' 
  })
  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthResult> {
    return await this.commandBus.execute(
      new LoginUserCommand(dto.email, dto.password)
    );
  }
}
```

### Best Practices

1. API Versioning
```typescript
const config = new DocumentBuilder()
  .setVersion('1.0')
  .addServer('v1')
  .build();
```

2. Security Schemes
```typescript
.addSecurityRequirements('bearer')
.addBearerAuth()
```

3. Response Schema Examples
```typescript
@ApiResponse({
  status: 200,
  description: 'Success',
  content: {
    'application/json': {
      example: {
        id: 'uuid',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe'
      }
    }
  }
})
```

4. Request Validation Examples
```typescript
@ApiProperty({
  minLength: 8,
  maxLength: 100,
  pattern: '^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$'
})
```

5. API Grouping and Tags
```typescript
@ApiTags('users')
@Controller('users')
export class UsersController {}
```

6. Operation Parameters
```typescript
@ApiParam({
  name: 'id',
  required: true,
  description: 'User unique identifier',
  schema: { type: 'string' }
})
```

### Access Swagger UI

After starting your application, you can access the Swagger UI at:
```
http://localhost:3000/api
```

## Required Environment Variables

```env
JWT_ACCESS_SECRET=your_secret_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_ISSUER=your_issuer
JWT_AUDIENCE=your_audience
```

## Best Practices

1. Always use HTTPS in production
2. Store tokens securely (e.g., HttpOnly cookies in web applications)
3. Never send tokens or credentials in URL parameters
4. Implement rate limiting for auth endpoints
5. Use strong passwords and implement password policies
6. Regularly rotate refresh tokens
