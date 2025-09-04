# Proje Kuralları: Clean Architecture & CQRS (NestJS + Prisma)

> **Amaç:** AI agent’ın projede **Clean Architecture** ve **CQRS** ilkelerine eksiksiz uymasını sağlamak. Bu belge **bağlayıcı kurallardır**. Agent, burada yazanların dışına **çıkmayacaktır**.

---

## 1) Yüksek Seviye Mimari
- **Katmanlar** (dıştan içe bağımlılık **yok**):
  - **Presentation / Interface**: `controllers`, `graphql resolvers`, **sadece** DTO/Validation, Auth/Guard, HTTP end.
  - **Application**: `use-cases`, `commands`, `queries`, `handlers`, `ports`, `mappers`, `validators`. **İş kuralı akışları** burada, **durum yok** (stateless).
  - **Domain**: `entities`, `value-objects`, `domain-services`, `domain-events` (saf TS). **Prisma bilinmez**, çerçeve bağımsız.
  - **Infrastructure**: `prisma`, `repositories (impl)`, `adapters`, `messaging`, `files`, `email`. **Prisma burada**.

- **Bağımlılık kuralı:** UI → Application → Domain; Infrastructure **sadece** Application/Domain’e implementasyon sağlar. Domain **hiçbir** dış modüle referans vermez.

---

## 2) Dizin Yapısı (örnek)
```
src/
  core/
    domain/
      entities/
      value-objects/
      events/
      services/
    application/
      commands/
      queries/
      handlers/
      ports/            # IRepository, IEmailSender vb.
      dto/
      mapping/
    infrastructure/
      prisma/
        prisma.module.ts
        prisma.service.ts
      repositories/
        user.prisma.repository.ts
      adapters/
  modules/
    users/
      presentation/
        users.controller.ts
        dto/
      application/      # module-özgü use-case'ler (opsiyonel)
      domain/           # module-özgü entity/value-object (opsiyonel)

  main.ts
  app.module.ts
```
> Not: İster merkezi `core/*` altında topla, ister her bounded context’i `modules/<bc>/*` içinde izole et. **Karışım yapma.**

---

## 3) CQRS Kuralları
- **Command** = durumu değiştiren istek. `CreateUserCommand`, `PublishFormCommand`.
- **Query** = sadece okuma, yan etkisiz. `GetUserByIdQuery`, `ListFormsQuery`.
- **Handler**: Her Command/Query için **tek** handler.
- **Bus**: `@nestjs/cqrs` `CommandBus` ve `QueryBus` kullanılır.
- **Event**: Domain veya Application event’leri ayrı tutulur. Yan etkiler (e-posta, bildirim) **event handler** ile çalışır.
- **Idempotency**: Command’larda mümkünse `requestId` + unique constraint; event’lerde tekrar çalışmaya dayanıklı ol.

---

## 4) Port-Adapter (Repository) Kuralları
- **Ports**: Application katmanında `IUserRepository`, `IFormRepository` gibi **arabirimler**.
- **Adapters/Impl**: Infrastructure’da Prisma ile `UserPrismaRepository implements IUserRepository`.
- **Domain’in Prisma bilmemesi** şarttır. Model mapping **mapper** üzerinden yapılır (App ↔ Domain ↔ Prisma).

**Örnek Port** (`src/core/application/ports/user-repository.port.ts`):
```ts
export interface FindAllParams { skip?: number; take?: number; }
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  findAll(p?: FindAllParams): Promise<User[]>;
}
```

**Örnek Impl** (`src/core/infrastructure/repositories/user.prisma.repository.ts`):
```ts
@Injectable()
export class UserPrismaRepository implements IUserRepository {
  constructor(private readonly db: PrismaService) {}
  private toDomain(r: any): User { return new User(r.id, r.email, r.passwordHash, r.firstName, r.lastName); }
  async findById(id: string) { const r = await this.db.user.findUnique({ where: { id } }); return r? this.toDomain(r): null; }
  // ...diğer metotlar
}
```

---

## 5) Validation, DTO ve Mapping
- **DTO**: Presentation katmanında `class-validator` ile doğrulama.
- **Mapping**: DTO → Command/Query → Domain Entity; geri dönüşte Entity → DTO.
- Controller içinde **iş kuralı yok**, sadece dönüşüm ve `bus` çağrısı.

**Controller İskele**:
```ts
@Controller('users')
export class UsersController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const id = await this.commandBus.execute(new CreateUserCommand(dto.email, dto.password, dto.firstName, dto.lastName));
    return { id };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return await this.queryBus.execute(new GetUserByIdQuery(id));
  }
}
```

---

## 6) Transaction & Birim İşlemleri
- **Prisma** transaction’ı Application katmanındaki use-case’lerde, repository çağrılarını sarmalayarak kullan.
- Kompozit işlemler (ör. form oluştur + ilk versiyonu kaydet) tek transaction.

**Örnek (özet)**:
```ts
await this.db.$transaction(async (tx) => {
  await repoA.create(entityA, tx);
  await repoB.create(entityB, tx);
});
```
> Repository’ler `tx?: Prisma.TransactionClient` parametresi alacak şekilde tasarlanmalı.

---

## 7) Hata Yönetimi
- Domain hataları için `DomainError`/`Result` tipi veya `Either` kullanımı.
- Controller seviyesinde Nest `HttpException` dönüştürücü (exception filter) ile HTTP koda çevir.
- **Magic string** yok; sabitler ve error code’lar merkezi.

---

## 8) Güvenlik ve Yetkilendirme
- Auth Guard’lar Presentation katmanında.
- Permission kontrolü Application katmanında **saga/use-case** başlangıcında yapılır.
- Domain katmanı **kullanıcı** veya **token** detaylarını bilmez.

---

## 9) Test Stratejisi
- **Unit**: Domain ve Application handler’ları **mock repository** ile test et.
- **Integration**: Prisma test DB (Docker) ile repository & handler entegrasyonu.
- **E2E**: HTTP üzerinden controller → bus → repo akışı.
- Her test izole DB kullanır (migrate + seed minimal).

---

## 10) Kodlama Standartları
- **İsimlendirme**: `PascalCase` sınıflar, `camelCase` metot/değişken, `UPPER_SNAKE_CASE` env.
- **Dosya adları**: `kebab-case`.
- **Pure function** tercih et; yan etkileri event/adapter’a taşı.
- **Linter/Formatter**: ESLint + Prettier zorunlu.

---

## 11) Ortam Değişkenleri
- **Yalnızca tek DB**: `DATABASE_URL` (Prisma), JWT vb. ayrı başlıklarda.
- `.env.example` tutulur; gizli değerler `.env`’de.

---

## 12) Agent İçin Zorunlu Talimatlar
1. **Katman ihlali yapma.** Domain hiçbir dış pakete (Prisma/Nest) referans vermeyecek.
2. **CQRS ayrımı**: Yazma için *Command*, okuma için *Query* oluştur.
3. Her yeni use-case için: DTO → Command/Query → Handler → Port çağrıları → (gerekirse) Event publish akışını uygula.
4. Repository **arabirimini** önce yaz, sonra Prisma implementasyonunu ekle.
5. Transaction gereken akışlarda `PrismaService` üzerinden `$transaction` kullan; repository’lere `tx` geçir.
6. Controller’larda **iş kuralı yazma**; sadece doğrulama & bus çağrısı.
7. **Loglama** Application veya Infrastructure’da; Domain’de log yok.
8. Test yazmadan PR açma. (En az 1 unit + 1 integration.)
9. Env bağımlılığını config servis/adapter ile soyutla.
10. Dosya/dizin yerleşimi bu dokümana **birebir** uyacak.

---

## 13) Hızlı Şablonlar
**Command**
```ts
export class CreateUserCommand { constructor(
  public readonly email: string,
  public readonly password: string,
  public readonly firstName: string,
  public readonly lastName: string,
) {}
}
```
**CommandHandler**
```ts
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, string> {
  constructor(private readonly users: IUserRepository, private readonly hasher: IPasswordHasher) {}
  async execute(c: CreateUserCommand): Promise<string> {
    const hash = await this.hasher.hash(c.password)
    const user = User.createNew(c.email, hash, c.firstName, c.lastName)
    const saved = await this.users.create(user)
    return saved.id
  }
}
```
**Query**
```ts
export class GetUserByIdQuery { constructor(public readonly id: string) {} }
```
**QueryHandler**
```ts
@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery, UserDto | null> {
  constructor(private readonly users: IUserRepository) {}
  async execute(q: GetUserByIdQuery): Promise<UserDto | null> {
    const u = await this.users.findById(q.id)
    return u ? UserDto.from(u) : null
  }
}
```

---

## 14) PR Kontrol Listesi
- [ ] Katman ihlali yok
- [ ] Command/Query ayrımı doğru
- [ ] Port yazıldı, impl Infrastructure’da
- [ ] Transaction kurgusu doğru
- [ ] Unit & Integration test eklendi
- [ ] Env/config dokümante

---

## 15) Sonraki Adımlar
- İlk bounded context: **Forms** (Form, FormVersion, Record) → command/query iskeletleri.
- Domain kuralları: sürüm yayınlama, kayıt durum geçişleri (Open→Assigned→Resolved) için event-driven tasarım.
- İzleme: metrics endpoint (okuma tarafında), audit trail (event-store veya outbox).

