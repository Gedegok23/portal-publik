# Public API contract implemented

Based on `PORTAL.md` §4.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/public/laporan?kategori=&wilayah=&status=&sort=&page=&per_page=&q=` | Public paginated reports |
| GET | `/api/public/laporan/:id` | Public report detail + status timeline + before/after photos |
| GET | `/api/public/scorecard` | Institution accountability metrics |
| GET | `/api/public/tren` | Category and weekly trend data + latest weekly summary |
| GET | `/api/public/cek-status?kode=xxx` | Tracking-code status lookup |
| GET | `/api/public/laporan/map?...` | Lightweight map projection already expected by the supplied frontend |
| GET | `/api/public/statistik` | Homepage aggregate metrics already expected by the supplied frontend |

All public handlers are GET-only. No `/api/admin/*` route exists in this service.

## Public response policy

The public JSON DTOs intentionally expose only the fields required by the portal UI. Internal columns such as the tracking code, full redacted text, hoax score, manual-review flag, and reporter identity are stored in PostgreSQL but are not selected into public responses.
