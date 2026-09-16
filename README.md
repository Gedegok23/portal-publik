# Portal Publik

Frontend for the public, read-only, no-login transparency portal described in
`PORTAL.md`. Next.js 14 (App Router) + TypeScript + Tailwind, matching the
tech stack and design spec in the doc.

## Getting started

```bash
npm install
npm run dev
```

Opens on http://localhost:3000. Runs against **mock data** out of the box
(`lib/mock-data.ts`) so you can build/demo the UI before the Golang backend
exists.

## Wiring up the real backend

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_API_BASE_URL` to your Golang API's base URL.
3. That's it — `lib/api.ts` switches from mock data to real `fetch` calls
   automatically. No page or component changes needed.

Two endpoints assumed but not explicit in PORTAL.md §4 — confirm with the
backend dev before wiring:
- A geo-projection for the map (`/api/public/laporan/map` in `lib/api.ts`) —
  §3.3 says "filter yang sama seperti halaman daftar" but doesn't specify
  whether lat/lng comes back on the list endpoint or a dedicated one.
- Aggregated homepage stats (`total_laporan`, `jumlah_selesai`, average
  response time) — not its own endpoint in §4, currently derived client-side
  from mock data. Ask whether `/api/public/laporan` should return this as a
  `meta` block, or whether it needs its own endpoint.

## Project structure

```
app/
  layout.tsx              shared header/footer/nav, Inter font
  page.tsx                Beranda (/)
  laporan/page.tsx         Daftar laporan (/laporan)
  laporan/[id]/page.tsx    Detail laporan
  peta/page.tsx           Peta laporan (Leaflet, client-only)
  scorecard/page.tsx      Scorecard instansi
  tren/page.tsx           Tren & statistik
  cek-status/page.tsx     Cek status by kode lacak
components/
  StatusBadge, LaporanCard, FilterBar, Pagination,
  TrendChart (bar+line), ScorecardTable, PetaLaporan (Leaflet)
lib/
  types.ts        TypeScript types mirroring the API contract (§4)
  constants.ts    status colors/labels, category metadata — single source
                  of truth, must stay in sync with the Dashboard app (§2)
  api.ts          fetch wrappers for the 5 endpoints; mock/real switch
  mock-data.ts    deterministic fake data for local dev
```

## §6 checklist — status and how to verify

- [x] **No requests to `/api/admin/*`** — nothing in this codebase calls
  admin endpoints; only `lib/api.ts` makes network calls, all to
  `/api/public/*`.
- [ ] **No sensitive columns in fetched responses** — `lib/types.ts`
  deliberately omits `kode_lacak`, full `teks_terredaksi`, `hoax_score`,
  `butuh_review_manusia`, and reporter identity from every type. **This only
  protects you if the real backend actually excludes them from the JSON
  body.** Once connected to the live API, open the Network tab on every page
  and confirm those fields are genuinely absent — TypeScript types don't
  stop a field from arriving over the wire.
- [x] **Fonts and status badge colors match spec** — see `lib/constants.ts`
  (`STATUS_CONFIG`) and `tailwind.config.ts`; Inter is loaded with weights
  400/500/600/700 in `app/layout.tsx`.
- [x] **Responsive on mobile** — map filter panel becomes a floating overlay,
  scorecard table scrolls horizontally on narrow screens, card grids
  collapse to a single column. Worth a manual pass on a real device/emulator
  before shipping, especially the Leaflet map's touch interactions.

## Security: Next.js 16 upgrade (Sept 2026)

`npm audit` flagged a critical unauthenticated RCE plus several DoS/cache-poisoning
advisories affecting every Next 14–16.3.0-preview build. Next 14 is EOL — the real
fix is Next 16.3.5, which is a major version with genuine breaking changes, not a
drop-in patch. This project has been migrated:

- **`next` → 16.3.5, `react`/`react-dom` → 19** (Next 16 requires React 19).
- **`params` and `searchParams` are now `Promise`s** in Server Component pages —
  updated in `app/laporan/page.tsx` and `app/laporan/[id]/page.tsx` (`await` them
  before use). This is the change most likely to bite you if you add new dynamic
  routes later — remember the new pages need the `Promise<...>` type too.
- **`react-leaflet` → v5** (the v4 line only supports React 18; mixing v4 with
  React 19 throws a "Map container is already initialized" runtime error).
- **ESLint → v9 with flat config** (`eslint.config.mjs` replaces the old
  `.eslintrc.json`), since `next lint` was removed from the core package and
  `eslint-config-next@16` requires ESLint 9's config format.

**Not yet verified** (couldn't run `npm install`/`npm run build` in the sandbox
this was generated in — no network access):
- Whether `recharts@2.15` installs cleanly against React 19 without peer-dependency
  warnings. If `npm install` complains, either bump recharts further (check for a
  release explicitly listing React 19 support) or install with
  `--legacy-peer-deps` as a stopgap.
- Full `npm run build` success end-to-end — run this locally before deploying, and
  fix any TypeScript errors Next 16 surfaces that weren't caught above (e.g. other
  Next 16 async-API changes like `cookies()`/`headers()`, which this codebase
  doesn't currently use but may if you extend it).
- Turbopack is now Next's default bundler. This project has no custom Webpack
  config, so it should be unaffected, but worth confirming your first `npm run
  dev` doesn't surprise you.

Run `npm audit` again after `npm install` to confirm the critical/high findings
are gone.

## UI refresh + Palembang location (Sept 2026)

- **Visual style**: cards now use rounded-2xl corners, soft shadows, hover
  lift/scale transitions, colored category "avatar" icons, and relative
  timestamps ("3 jam lalu") for a feed-like feel — while keeping **numbered
  pagination, not infinite scroll**, per the original §3.2 spec. `lucide-react`
  was added for crisp icons (map pin, users, stat icons).
- **Location data moved to Palembang.** `lib/constants.ts` now exports
  `WILAYAH_OPTIONS` (Palembang kecamatan: Ilir Barat I, Ilir Timur II,
  Kemuning, Plaju, Sukarami, Kalidoni) and `CITY_CENTER` (Palembang
  coordinates), used by both the mock data generator and the map default
  view — previously these were duplicated Jakarta values in two separate
  files, now there's one source of truth.
- **Removed a stray `LaporanFeed` "load more" component** that had been
  scaffolded but never wired into the conversation's visible history — it
  implemented infinite-scroll-style incremental loading, which directly
  contradicts the "pagination, not infinite scroll" requirement in §3.2.
  If you're diffing against an earlier copy of this project and see that
  file, it should not exist; `app/laporan/page.tsx` should import
  `Pagination`, not `LaporanFeed`.

## Illustrations & animation (Sept 2026)

- **Illustrations are original hand-drawn SVGs**, not downloaded images —
  written directly as React components in `components/illustrations/`, so
  there are no licensing/copyright concerns. Three pieces: `HeroIllustration`
  (homepage), `EmptyState` (no-results states on `/laporan` and
  `/cek-status`), `NotFoundIllustration` (404 page).
- **No fake report photos were added to list/feed cards.** PORTAL.md's API
  contract (§4) doesn't include a photo field on the list endpoint — only the
  detail endpoint has `foto_sebelum`/`foto_sesudah`, and only for completed
  reports. Inventing a photo field for cards would mean the real backend
  either has to match a shape I made up, or the UI silently breaks when it
  doesn't. Instead, cards get a colored "cover strip" (`KATEGORI_CONFIG.bar`)
  for visual identity without new data requirements.
- **Motion**: staggered fade-in-up on card grids, floating hero blobs/pin/
  badge, animated count-up on homepage stats, a spinner on the cek-status
  button, a pulsing dot on non-terminal status badges (diterima,
  diverifikasi, ditugaskan, diproses), and a shimmer skeleton while the map
  loads. All animations are defined once in `tailwind.config.ts` and respect
  `prefers-reduced-motion` (see `app/globals.css`) — users with that OS
  setting get static content instead of motion.

## Spec compliance fixes (Sept 2026)

Full pass against every gap identified in a PORTAL.md audit, cross-checked
against Dev A's real backend implementation (not just assumptions):

- **Map pin color bug fixed** — §3.3 requires pin color = category color;
  it was wrongly using status color. `PetaLaporan.tsx` now uses
  `KATEGORI_CONFIG[...].hex`.
- **Radius reverted to spec** — §2 pins cards/buttons to `rounded-lg` (8px).
  A prior "make it more social" pass had widened these to `rounded-2xl`;
  that's been undone everywhere. `rounded-full` is kept only for genuine
  badges/chips/avatars/dots, matching §2's actual two-shape rule.
- **SWR is now genuinely used** for interactive client-side filtering, per
  §1's architecture (`native fetch di Server Component untuk data awal; SWR
  untuk filter interaktif di client`). `/laporan`'s Server Component does
  exactly one fetch for the first paint (SEO), then hands off to
  `LaporanListClient`, which manages all filter/page/search changes via
  `useSWR` — no further server round-trips. `/peta` was converted the same
  way. The URL bar still updates (via `history.replaceState`, not Next
  navigation) so links stay shareable/bookmarkable.
- **Search (`q`) is now real**, not decorative — the backend added
  `?q=` support to `/laporan` and `/laporan/map` (ILIKE across
  ringkasan/lokasi/kategori); `lib/api.ts`, `lib/types.ts`, and the list page
  now pass it through end to end, with a "Menampilkan hasil untuk ..." chip
  and clear button in `FilterBar`.
- **Mobile "table/map → card" behavior** — `ScorecardTable` now renders a
  stacked card list below `md:`, full table above it. `/peta`'s filter panel
  is a normal stacked block on mobile and only becomes the floating overlay
  described in §3.3 at `md:` and up.
- **shadcn/ui — partially adopted, deliberately, not fully.** Added its
  actual foundational pattern (`class-variance-authority`, `tailwind-merge`,
  the `cn()` utility, a real `Button` primitive built with `cva`) and wired
  it into `Pagination`, the cek-status submit button, and the homepage
  search button. **Not converted**: the native `<select>` dropdowns in
  `FilterBar` (a full swap needs `@radix-ui/react-select`, which I didn't
  want to hand-write untested without being able to run `npm install`/
  `npm run build` myself — native selects are already keyboard/screen-reader
  accessible, so this is a deferred nice-to-have, not a broken gap), and
  `StatusBadge`/card containers (they need dynamic per-status/per-category
  colors that don't map cleanly onto shadcn's default variant system). If
  you want the full conversion, it's a clean follow-up task, now that the
  foundation (`cn()`, `cva` pattern) is already in place.
- **Card images added** — see the next section.

## Card cover images (Sept 2026)

Every card on the homepage and `/laporan` now has a real image, not just a
color strip: `components/illustrations/CategoryCover.tsx` renders an
original, hand-drawn vector illustration per category (a road/cone motif for
infrastruktur, a medical cross for kesehatan, overlapping figures for
sosial, a tree for lingkungan, a shield for keamanan, a document stack for
lainnya).

**Why not real per-report photos**: PORTAL.md §4's API contract has no photo
field on `/api/public/laporan` (the list endpoint) — only the detail
endpoint returns `foto_sebelum`/`foto_sesudah`, and only for completed
reports. Inventing a `foto` field for the list/card view would mean either
the real backend has to add a field it was never speced to have, or the
frontend silently breaks (or shows nothing) once wired to the real API.
Category-based cover art uses data that's actually guaranteed to exist on
every report, so it can't drift out of sync with the backend. If per-report
photos on cards are wanted, that's a spec change worth a deliberate
conversation with Dev A first, not something to slip in as a side effect of
a "make it prettier" request.

## Known gaps / next steps

- The map page filters client-side on `kategori`/`status` after fetching all
  points — fine for MVP volumes, but if the report count grows, push
  filtering server-side via query params like the list page does.
- `getStatistikRingkas` in mock mode returns real aggregate numbers, but the
  "real API" branch is a placeholder returning zeros until the backend
  contract for homepage stats is settled (see above).
- No test suite yet. Given the refactor/testing framework discussed earlier
  in this conversation: start with a characterization test hitting
  `/laporan` with each filter combination once the real API is live, before
  making further changes to `lib/api.ts`.
