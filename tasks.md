# Mimari Tutarlılık ve Teknik Borç Azaltma Görevleri

> Amaç: Clean Architecture & CQRS uyumunu güçlendirmek, sızıntıları gidermek, transaction sınırlarını netleştirmek, çalışma zamanı modül çözümlemesini tutarlı hâle getirmek.

## Önceliklendirme
- P0: Derlemeyi/çalıştırmayı veya mimariyi doğrudan etkileyen kritikler
- P1: Orta dönemde tutarlılık/borç azaltma
- P2: İyileştirme/gelecek hazırlığı

---

### T-001 — Core’da Nest/Prisma sızıntısı temizliği (P0)
**Neden:** Application/Domain katmanlarının framework-agnostic kalması gerekir.  
**Yapılacaklar:**
- `src/core/application` ve `src/core/domain` içindeki **gereksiz Nest importları** (örn. `NotFoundException`) ve `@prisma/*`, `class-validator` izlerini kaldır.
- Eğer ihtiyaç varsa, adapter seviyesinde eşdeğer hata eşlemeyi kullan.
**Kapsam/Dosyalar:** `src/core/application/**`, `src/core/domain/**`  
**Kabul Kriterleri (DoD):**
- Core katmanlarında **Nest/Prisma/class-validator importu yok**.
- Build ve testler yeşil.
**Doğrulama Komutları (örnek):**
- PowerShell:  
  `Select-String -Path src\core\**\*.ts -Pattern "from '@nestjs|from '@prisma|class-validator"`
- Bash:  
  `grep -R "from '@nestjs\|from '@prisma\|class-validator" src/core || true`

---

### T-002 — Adapter’larda hata eşleme import stratejisini sabitle (P0)
**Neden:** Dinamik importlar + `.js` uzantıları NodeNext/ESM ayarlarında kırılganlık yaratabilir.  
**Yapılacaklar:**
- `modules` altındaki adapter’larda **dinamik import** yerine **statik import** kullan.
- `.js` uzantılarını **projenin modül stratejisine** göre tutarlılaştır (bkz. T-010).
**Kapsam/Dosyalar:** `src/modules/**/error-mapper*`, bu mapper’ı kullanan controller/guard/strategy.  
**DoD:**
- Tüm kullanımlar statik import.
- Çalışma zamanı hatası yok; E2E/manuel akışlar çalışıyor.

---

### T-003 — Hata modeli: hafif custom error sınıfları (P1)
**Neden:** `new Error(code)` ile **message tabanlı** eşleme kırılgan; tip güvenliği zayıf.  
**Yapılacaklar:**
- `AppError` taban sınıfı + seçili senaryolar için (örn. `InvalidCredentialsError`) hafif sınıflar.
- Mapper: custom error → HTTP status/body (adapter katmanında).
**Kapsam/Dosyalar:** `src/core/application/errors/**`, `src/modules/shared/error-mapper.ts`  
**DoD:**
- En az 1–2 kritik akış (`login`, `refresh`) custom error kullanıyor.
- Mapper bu sınıfları doğru HTTP’ye çeviriyor.
- Test(ler) güncel.

---

### T-004 — Unit of Work / Transaction boundary ekle (P0)
**Neden:** Çoklu repository/yan etkilerde atomiklik garanti değil (özellikle auth revoke+create).  
**Yapılacaklar:**
- `IUnitOfWork` portu (`run<T>(work)` imzası).
- Prisma adaptörüyle `$transaction` sarmalama; tx-aware repository örnekleri ver.
- `login/refresh` komut handler’larında `uow.run(...)` kullan.
**Kapsam/Dosyalar:**  
`src/core/application/ports/unit-of-work.port.ts`,  
`src/core/infrastructure/prisma/prisma-unit-of-work.ts`,  
ilgili handler’lar.  
**DoD:**
- `login/refresh` akışları transaction altında çalışıyor.
- Kısmi durum bırakmıyor (örnek hata senaryolarında).

---

### T-005 — JWT `expiresIn` tutarlılığı (P1)
**Neden:** Sabit `expiresIn: 900` ile JwtModule config’i farklılaşınca drift oluşur.  
**Yapılacaklar:**
- `expiresIn` değerini **config**’ten oku veya **gerçek token TTL**’inden türet.
- Config tip güvenli (örn. zod/joi) şema varsa ona ekle.
**Kapsam/Dosyalar:** Token servisi / config erişimi.  
**DoD:**
- Uygulama içinde **tek kaynaktan** `expiresIn`.
- Test/manuel doğrulama ile eşleşme teyidi.

---

### T-006 — DTO/Model sınırları & mapping politikası (P2)
**Neden:** Şu an kabul edilebilir; ama ileride presentation ayrışırsa ihtiyaç doğar.  
**Yapılacaklar:**
- Controller seviyesinde opsiyonel presentation DTO + mapper (ileriye dönük şablon).
- Dokümante et: Application I/O tipleri framework-agnostic kalır; presentation mapping adapter’dadır.
**Kapsam/Dosyalar:** `src/modules/**/dto`, gerekli mapper’lar.  
**DoD:**
- En az bir endpoint için “DTO ←→ Application Output” örnek mapping mevcut.
- README/Rules’e kısa not eklendi.

---

### T-007 — Logger portunun kullanıma alınması (P1)
**Neden:** Port var ama görünürlük düşük; kritik akışlar loglanmıyor.  
**Yapılacaklar:**
- `login`, `refresh`, `create-user`, hata durumları: `ILogger.info/warn/error`.
- PII maskesi/hassas alanları loglamama notu.
**Kapsam/Dosyalar:** ilgili handler’lar + logger adapter.  
**DoD:**
- Kritik akışlarda anlamlı, yapılandırılmış loglar.
- Testlerde/çalışmada gözlemlenebilir.

---

### T-008 — Test etkisi ve stabilizasyon (P1)
**Neden:** Handler isim/konum değişimleri; adapter kayıtları etkilenmiş olabilir.  
**Yapılacaklar:**
- Kırılan unit/integration testleri güncelle.
- Application handler’ları **yalın** (mock repo) testlerle kapsa.
**Kapsam/Dosyalar:** `test/**`  
**DoD:**
- Tüm testler yeşil; yeni unit testler ekli.

---

### T-009 — `dist/`’i repodan temizle (P0)
**Neden:** Build çıktıları VCS’de kalmış olabilir; CI/CD ve merge riskleri.  
**Yapılacaklar:**
- `.gitignore` kontrolü.
- `git rm -r --cached dist && git commit` ile temizleme.
**Kapsam/Dosyalar:** `.gitignore`, Git index.  
**DoD:**
- `git ls-files | grep dist` boş döner.

---

### T-010 — ESM/NodeNext vs CJS modül stratejisini sabitle (P0)
**Neden:** `.js` uzantıları ve dinamik importlar çalışma zamanında hataya yol açabilir.  
**Yapılacaklar:**
- Mevcut derleme/çalıştırma zincirini doğrula (Nest build → `dist` target/module).
- **Tek strateji** seç: (A) CJS (tsconfig: `module=commonjs`, importlarda uzantısız), ya da (B) NodeNext/ESM (uzantılar ve ts/jest ayarları uyumlu).
- Seçime göre **tüm importları** normalize et.
**Kapsam/Dosyalar:** `tsconfig*.json`, jest/runner config, import satırları.  
**DoD:**
- `npm run build && npm run start:prod` sorunsuz.
- Jest/E2E aynı stratejide problemsiz.
