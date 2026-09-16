package models

import "time"

type Institution struct {
	ID        string    `gorm:"column:id;primaryKey"`
	Nama      string    `gorm:"column:nama"`
	CreatedAt time.Time `gorm:"column:created_at"`
}

func (Institution) TableName() string { return "institutions" }

type Report struct {
	ID                 string     `gorm:"column:id;primaryKey"`
	Kategori           string     `gorm:"column:kategori"`
	LokasiUmum         string     `gorm:"column:lokasi_umum"`
	Ringkasan          string     `gorm:"column:ringkasan"`
	TeksTerredaksi     string     `gorm:"column:teks_terredaksi"`
	KodeLacak          string     `gorm:"column:kode_lacak"`
	Status             string     `gorm:"column:status"`
	HoaxScore          *float64   `gorm:"column:hoax_score"`
	ButuhReviewManusia bool       `gorm:"column:butuh_review_manusia"`
	ReporterIdentity   *string    `gorm:"column:reporter_identity"`
	DuplicateOf        *string    `gorm:"column:duplicate_of"`
	InstitutionID      *string    `gorm:"column:institution_id"`
	Lat                *float64   `gorm:"column:lat"`
	Lng                *float64   `gorm:"column:lng"`
	FotoSebelum        *string    `gorm:"column:foto_sebelum"`
	FotoSesudah        *string    `gorm:"column:foto_sesudah"`
	ReceivedAt         time.Time  `gorm:"column:received_at"`
	CompletedAt        *time.Time `gorm:"column:completed_at"`
	CreatedAt          time.Time  `gorm:"column:created_at"`
	UpdatedAt          time.Time  `gorm:"column:updated_at"`
}

func (Report) TableName() string { return "reports" }

type StatusLog struct {
	ID        int64     `gorm:"column:id;primaryKey"`
	ReportID  string    `gorm:"column:report_id"`
	Status    string    `gorm:"column:status"`
	Tanggal   time.Time `gorm:"column:tanggal"`
	CreatedAt time.Time `gorm:"column:created_at"`
}

func (StatusLog) TableName() string { return "status_logs" }

type WeeklySummary struct {
	ID        int64     `gorm:"column:id;primaryKey"`
	WeekStart time.Time `gorm:"column:week_start"`
	Summary   string    `gorm:"column:summary"`
	CreatedAt time.Time `gorm:"column:created_at"`
}

func (WeeklySummary) TableName() string { return "weekly_summaries" }
