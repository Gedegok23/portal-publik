# Portal Publik API

Golang + Gin + GORM + PostgreSQL backend untuk `PORTAL.md`. Endpoint publik bersifat read-only dan tidak memakai autentikasi, sesuai kontrak dokumen.

## Endpoint

- `GET /api/public/laporan?kategori=&wilayah=&status=&sort=&page=&per_page=&q=`
- `GET /api/public/laporan/:id`
- `GET /api/public/laporan/map?kategori=&wilayah=&status=&q=` — projection ringan untuk peta yang sudah dipakai frontend.
- `GET /api/public/scorecard`
- `GET /api/public/tren`
- `GET /api/public/cek-status?kode=...`
- `GET /api/public/statistik` — agregat homepage yang dibutuhkan frontend karena kontrak dokumen tidak menyediakan endpoint statistik terpisah.
- `GET /health`

## Sensitif

`kode_lacak`, `teks_terredaksi`, `hoax_score`, `butuh_review_manusia`, dan `reporter_identity` tersimpan di database tetapi **tidak pernah** diserialisasikan oleh handler public. Hal ini sengaja dilakukan di query/response layer, bukan disembunyikan di frontend.

## Database

Jalankan `migrations/001_init.sql` pada PostgreSQL, lalu optional seed:

```bash
go run ./cmd/seed
```

Local config:

```bash
cp .env.example .env
```

Kemudian:

```bash
go mod tidy
go run ./cmd/api
```

Atau dengan Docker Compose dari folder `backend`:

```bash
docker compose up --build
```

Catatan: container API menunggu database tersedia; jalankan migration sebelum seed. Untuk deployment production, gunakan migration runner/CI migration step yang terpisah dari aplikasi.

## Code review fixes (Sept 2026)

A static code review (no Go toolchain / network access available in the
review environment, so this is careful reading, not a compiled/tested
verification — please run `go vet`, `go build`, and hit the endpoints
yourself to confirm) found and fixed:

- **`/tren`'s week-label SQL was garbled.** The raw SQL for `per_periode`
  was written inside a Go backtick (raw) string containing `\"` — backtick
  strings don't process backslash escapes, so those literal backslashes were
  being sent straight to Postgres, corrupting the `TO_CHAR` format string
  (producing something like `2026-\W\36` instead of `2026-W36`). Fixed by
  removing the unnecessary backslashes — a backtick string doesn't need
  internal double quotes escaped at all.
- **`applyReportFilters` now explicitly returns and is reassigned** at both
  call sites (`listLaporan`, `mapLaporan`), instead of calling `.Where(...)`
  on the passed-in `*gorm.DB` and discarding the return value. This specific
  GORM version's clone-on-first-chain-call behavior may make the old code
  work in practice, but that's an internal implementation detail, not part
  of GORM's documented contract (their own docs always show reassignment
  for exactly this "build up conditions in a helper" pattern). Worth
  verifying with an actual filtered request once you can run this, since a
  static read can't fully rule out the original version being fine.
- **`per_page` is now a real, bounded query param.** `MAX_PAGE_SIZE` /
  `MaxPage` was configured but never read anywhere — `per_page` wasn't a
  client-adjustable param at all, so the config existed but did nothing.
  It's now wired up: `?per_page=` is accepted and clamped to `MAX_PAGE_SIZE`.
- **`docker-compose.yml`: API now waits for Postgres to be *ready*, not just
  *started*.** Added a `pg_isready` healthcheck on `db` and changed `api`'s
  `depends_on` to `condition: service_healthy`. Without this, a first
  `docker-compose up` can have the API try to connect before Postgres is
  accepting connections yet — a common flaky-first-run trap.
