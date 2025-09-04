Mimari Yerleşim (Nerede Ne Olacak?)
1) Domain (core/domain)

Sorumluluk: İş kuralları, saf model.

Entity / Aggregate

User (id, email, passwordHash, roles, permissions…)

RefreshToken (id/jti, userId, expiresAt, revoked)

Domain Events (ops.)

UserRegistered

Kurallar

Şifre ham hali domain’e girmez; hep passwordHash olarak taşınır.

Domain hiçbir framework bağımlılığı içermez.

2) Application (core/application)

Sorumluluk: Use-case’ler (CQRS), port/adapter arayüzleri.

Ports (abstract interfaces)

IUserRepository (kullanıcıyı email/id ile getir, oluştur, güncelle…)

IRefreshTokenRepository (oluştur, doğrula/jti bul, revoke…)

IPasswordHasher (hash/compare)

ITokenService (signAccessToken(payload), signRefreshToken(jti/payload), verify…)

IDateTime (şimdi, addMinutes vs. – test edilebilirlik)

Commands / Queries

RegisterUserCommand + Handler (parola hash, user create, opsiyonel event publish)

LoginUserCommand + Handler (email+parola doğrula → access+refresh üret, refresh DB’ye yaz)

RefreshTokenCommand + Handler (refresh jti doğrula, rotate: eskiyi revoke et, yenisini üret)

LogoutCommand + Handler (ilgili refresh token(lar)ı revoke)

GetMeQuery + Handler (istekteki userId’ye göre kullanıcıyı getir)

DTO / Result modelleri

AuthResultDto (accessToken, refreshToken, expiresIn)

Uygulama içi sade DTO’lar (controller DTO’larından ayrıdır)

Application katmanı yalnızca port’ları bilir; gerçek implementasyonları görmez.

3) Infrastructure (core/infrastructure)

Sorumluluk: Port’ların gerçek implementasyonları + 3rd party adaptörleri.

Repositories (Prisma)

UserPrismaRepository implements IUserRepository

RefreshTokenPrismaRepository implements IRefreshTokenRepository

Services

BcryptPasswordHasher implements IPasswordHasher

JwtTokenService (Nest @nestjs/jwt kullanır) implements ITokenService

SystemDateTime implements IDateTime

Prisma

PrismaService, PrismaModule (export edilir)

schema.prisma’da RefreshToken tablosu (jti, userId, expiresAt, revoked, createdAt)

Config

.env okuyan ConfigModule/ConfigService ayarları

Infrastructure, Application’ın port’larını uygular ve Interface (presentation) tarafına DI ile sağlar.

4) Interface / Presentation (src/modules/**)

Sorumluluk: HTTP katmanı (Nest controller/guard/strategy/pipe).

AuthModule (presentation)

Controllers

AuthController → /auth/register, /auth/login, /auth/refresh, /auth/logout, /auth/me

Controller yalnızca CommandBus/QueryBus çağırır; iş mantığı handler’dadır.

Guards & Strategies

JwtAccessStrategy (Passport/JWT) → Access Token doğrulaması (sadece doğrulama + payload’dan userId çıkarımı)

JwtAccessGuard (PassportAuthGuard türevi)

JwtRefreshStrategy (opsiyonel, cookie/bearer) → Refresh Token doğrulaması (yalnız doğrulama, iş mantığı yok)

JwtRefreshGuard

Decorators

@CurrentUser() → request’ten userId / claims çekmek

@Public() → global guard’ın atlayacağı endpoint işareti

(Zaten var olan) @Permissions() ile PermissionsGuard entegrasyonu

UsersModule

Controller’ları @UseGuards(JwtAccessGuard, PermissionsGuard) ile koru

Public gereken endpointlere @Public() ekle (ör. /auth/login, /auth/register)

Strategy & Guard’lar Interface katmanındadır ve yalnızca doğrulama/ayıklama yapar. Yetki kontrolü (policy/permission) de Interface’deki Guard ile uygulanır; ama hangi izin gerekeceğini belirleyen kurallar Application’da policy servisi üzerinden kurgulanabilir.

Akış Tasarımı (Kısa Özet)

Register

Controller → RegisterUserCommand → Handler:

IPasswordHasher.hash

IUserRepository.create

(ops.) UserRegistered domain event publish

Login

Controller → LoginUserCommand → Handler:

IUserRepository.findByEmail + IPasswordHasher.compare

ITokenService.signAccessToken + ITokenService.signRefreshToken

IRefreshTokenRepository.create(jti, userId, expiresAt)

Refresh

Controller → JwtRefreshGuard payload içinden jti/userId verir

RefreshTokenCommand → Handler:

IRefreshTokenRepository.find(jti) doğrula + rotate: eskiyi revoke, yenisini üret

Yeni access+refresh döndür

Logout

Controller → LogoutCommand → Handler:

İlgili refresh jti’yi (veya tüm aktiflerini) revoke

Yetki

PermissionsGuard (Interface) → Metadata’daki @Permissions(...) değerlerini alır

Kullanıcının izinlerini (claim veya GetUserPermissionsQuery) kontrol eder

Bağımlılık Okları (tek yön)

Interface → Application

Application → Domain

Infrastructure → Application (port implement eder)
(Nest DI ile Infrastructure implementasyonları Application port’larına bind edilir)

Domain hiçbir katmana bağımlı değil.

Dosya/Yol Önerisi
src/
  core/
    domain/
      user.entity.ts
      refresh-token.entity.ts
      events/user-registered.event.ts
    application/
      ports/
        user-repository.ts
        refresh-token-repository.ts
        password-hasher.ts
        token-service.ts
        datetime.ts
      auth/commands/
        register-user.command.ts
        register-user.handler.ts
        login-user.command.ts
        login-user.handler.ts
        refresh-token.command.ts
        refresh-token.handler.ts
        logout.command.ts
        logout.handler.ts
      auth/queries/
        get-me.query.ts
        get-me.handler.ts
  core/infrastructure/
    prisma/
      prisma.module.ts
      prisma.service.ts
      user.prisma.repository.ts
      refresh-token.prisma.repository.ts
    security/
      bcrypt-password-hasher.ts
      jwt-token.service.ts
      system-datetime.ts
    auth/
      auth.config.ts  (access/refresh ttl, issuer, audience)
  modules/
    auth/
      auth.module.ts
      controllers/auth.controller.ts
      guards/jwt-access.guard.ts
      guards/jwt-refresh.guard.ts
      strategies/jwt-access.strategy.ts
      strategies/jwt-refresh.strategy.ts
      decorators/current-user.decorator.ts
      decorators/public.decorator.ts
    users/
      users.module.ts
      controllers/users.controller.ts
      ...

.env Örnekleri
JWT_ACCESS_SECRET=change_me_access
JWT_REFRESH_SECRET=change_me_refresh
JWT_ACCESS_EXPIRES_IN=900          # 15 dk
JWT_REFRESH_EXPIRES_IN=1209600     # 14 gün (saniye)
JWT_ISSUER=duovera
JWT_AUDIENCE=duovera_api

Modül Bağlantıları (Nest DI)

AuthModule:

CqrsModule, PrismaModule, ConfigModule import

Providers (bind):

{ provide: IPasswordHasher, useClass: BcryptPasswordHasher }

{ provide: ITokenService, useClass: JwtTokenService }

{ provide: IUserRepository, useClass: UserPrismaRepository }

{ provide: IRefreshTokenRepository, useClass: RefreshTokenPrismaRepository }

{ provide: IDateTime, useClass: SystemDateTime }

Handlers (CQRS)

Strategies & Guards

UsersModule:

CqrsModule, PrismaModule, AuthModule import

Controller seviyesinde @UseGuards(JwtAccessGuard, PermissionsGuard)

Neden Bu Yerleşim “En Temizi”?

Kimlik doğrulama iş akışı (login/register/refresh) tamamen Application’da; test etmesi kolay.

Framework bağımlılığı (JWT kütüphanesi, Prisma, bcrypt) Infrastructure’da izole.

HTTP detayları (header, cookie, guard, strategy) Interface katmanında; domain/application kirlenmiyor.

CQRS net: Controller sadece Command/Query publish eder, handler’lar işi yapar.

Agent İçin Uygulanacak Adımlar (hemen)

Application port arayüzlerini oluştur (IPasswordHasher, ITokenService, IRefreshTokenRepository, IDateTime).

CQRS komut/sorgu + handler’ları ekle (register, login, refresh, logout, get-me).

Infrastructure implementasyonları yaz:

Prisma repo’lar (User, RefreshToken)

BcryptPasswordHasher, JwtTokenService, SystemDateTime

Prisma şemasına RefreshToken modelini ekle → migrate

AuthModule (interface):

Controller endpoint’leri

JwtAccessStrategy / JwtRefreshStrategy + Guard’lar

@CurrentUser, @Public

UsersModule controller’larını JwtAccessGuard ile koru; gerekliyse @Permissions(...).

E2E: Register→Login→Me→Refresh→Logout akışını test et; guard’ları gerçek JWT ile doğrula.