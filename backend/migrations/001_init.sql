CREATE TABLE IF NOT EXISTS institutions (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    kategori TEXT NOT NULL CHECK (kategori IN ('infrastruktur','kesehatan','sosial','lingkungan','keamanan','lainnya')),
    lokasi_umum TEXT NOT NULL,
    ringkasan TEXT NOT NULL,
    teks_terredaksi TEXT NOT NULL,
    kode_lacak TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('diterima','diverifikasi','ditugaskan','diproses','selesai','ditolak')),
    hoax_score NUMERIC(5,4),
    butuh_review_manusia BOOLEAN NOT NULL DEFAULT FALSE,
    reporter_identity TEXT,
    duplicate_of TEXT REFERENCES reports(id) ON DELETE SET NULL,
    institution_id TEXT REFERENCES institutions(id) ON DELETE SET NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    foto_sebelum TEXT,
    foto_sesudah TEXT,
    received_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK ((lat IS NULL AND lng IS NULL) OR (lat IS NOT NULL AND lng IS NOT NULL)),
    CHECK (foto_sesudah IS NULL OR status = 'selesai')
);

CREATE TABLE IF NOT EXISTS status_logs (
    id BIGSERIAL PRIMARY KEY,
    report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('diterima','diverifikasi','ditugaskan','diproses','selesai','ditolak')),
    tanggal TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weekly_summaries (
    id BIGSERIAL PRIMARY KEY,
    week_start DATE NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_kategori ON reports(kategori);
CREATE INDEX IF NOT EXISTS idx_reports_lokasi_umum ON reports(lokasi_umum);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_duplicate_of ON reports(duplicate_of);
CREATE INDEX IF NOT EXISTS idx_reports_institution_id ON reports(institution_id);
CREATE INDEX IF NOT EXISTS idx_reports_lat_lng ON reports(lat, lng);
CREATE INDEX IF NOT EXISTS idx_status_logs_report_date ON status_logs(report_id, tanggal);

CREATE OR REPLACE FUNCTION set_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reports_updated_at ON reports;
CREATE TRIGGER trg_reports_updated_at
BEFORE UPDATE ON reports
FOR EACH ROW EXECUTE FUNCTION set_reports_updated_at();
