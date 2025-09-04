# Prisma Basic Setup (Single Database)

> **Amaç:** AI agenta verilecek *basit ve hatasız* Prisma kurulum rehberi. **Sadece kurulum** yapılır; **tablo tanımları ve migrasyonlar bu dokümanda yapılmaz.**

---

## 0) Önkoşullar
- Node.js 18+ (öneri: 20 LTS)
- Çalışan bir PostgreSQL (lokalde veya Docker)

> Docker ile PostgreSQL çalıştırmak istersen:
```bash
# İsteğe bağlı
docker run -d --name duovera-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=Postgres123! \
  -e POSTGRES_DB=duovera_platform \
  -p 5432:5432 \
  postgres:16
```

---

## 1) Proje paketlerini kur
```bash
npm i -D prisma
npm i @prisma/client
```

---

## 2) Prisma'yı başlat (init)
```bash
npx prisma init --datasource-provider postgresql
```
Bu komut `prisma/` klasörünü ve varsayılan `schema.prisma` dosyasını oluşturur, ayrıca `.env` içine `DATABASE_URL` ekler.

---

## 3) `.env` dosyasını **tek veritabanına** göre düzenle
>
**Kullan:**
```dotenv
# --- PostgreSQL ---
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Postgres123!
POSTGRES_DB=aiAgentSampleDb
POSTGRES_PORT=5432

DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public
```
---

## 4) `schema.prisma` dosyasını sadeleştir
`prisma/schema.prisma` içeriğini **model olmadan** (yalnızca generator ve datasource) aşağıdaki gibi bırak:
```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
> Bu aşamada **model tanımlama ve migration yapılmayacak**. Sadece kurulum doğrulaması yapılır.

---

## 5) Kurulumu doğrula ve client üret
```bash
# Şemayı kontrol et
npx prisma validate

# Client üret (node_modules altına prisma client kodu yazar)
npx prisma generate
```
> Henüz model yoksa `migrate` çalıştırma. Sonraki adımlarda tablolar eklendiğinde `prisma migrate dev` kullanılacak.

---

## 6) Hızlı bağlantı testi (opsiyonel)
`tools/prisma-test.js` adında küçük bir script ile bağlantı test edebilirsin.
```bash
mkdir -p tools
```
```js
// tools/prisma-test.js
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

try {
  await prisma.$connect()
  console.log('✅ Prisma DB bağlantısı başarılı')
} catch (err) {
  console.error('❌ Prisma DB bağlantı hatası:', err)
} finally {
  await prisma.$disconnect()
}
```
```bash
node tools/prisma-test.js
```

---

## 7) NPM script (isteğe bağlı)
`package.json` içine kullanışlı komutlar ekleyebilirsin:
```json
{
  "scripts": {
    "prisma:validate": "prisma validate",
    "prisma:generate": "prisma generate",
    "prisma:studio": "prisma studio"
  }
}
```

---

## 8) AI Agent için net talimat
Agent, **yalnızca** aşağıdaki adımları uygulayacak:
1. `npm i -D prisma && npm i @prisma/client` çalıştır.
2. Proje kökünde `.env` dosyası yoksa **oluştur** ve bu dokümandaki içerikle doldur.
3. `npx prisma init --datasource-provider postgresql` çalıştır.
4. `prisma/schema.prisma` dosyasını bu dokümandaki **model içermeyen** şablonla güncelle.
5. `npx prisma validate` ve `npx prisma generate` çalıştır.
6. **Migration veya model oluşturma YAPMA.** (Bir sonraki aşamanın konusu.)

---

## 9) Sık karşılaşılan hata (P1001)
- **Hata:** `P1001: Can't reach database server at ...`
- **Çözüm Kontrol Listesi:**
  - PostgreSQL konteyneri/servisi çalışıyor mu?
  - Host adı doğru mu? (Docker içinden bağlanıyorsan `localhost` yerine servis adı)
  - `POSTGRES_PORT` eşleşiyor mu (varsayılan 5432)?
  - Güvenlik duvarı / port yönlendirme engeli var mı?
