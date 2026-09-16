package main

import (
	"fmt"
	"log"
	"math/rand"
	"time"

	"portal-publik/backend/internal/config"
	"portal-publik/backend/internal/db"
	"portal-publik/backend/internal/models"
)

func main() {
	cfg := config.Load()
	gormDB, err := db.Open(cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}

	for _, item := range []models.Institution{
		{ID: "dinas-pu", Nama: "Dinas Pekerjaan Umum"},
		{ID: "dinas-kesehatan", Nama: "Dinas Kesehatan"},
		{ID: "dinas-sosial", Nama: "Dinas Sosial"},
		{ID: "dlh", Nama: "Dinas Lingkungan Hidup"},
		{ID: "satpol-pp", Nama: "Satpol PP"},
	} {
		gormDB.FirstOrCreate(&item, models.Institution{ID: item.ID})
	}

	rand.Seed(42)
	categories := []string{"infrastruktur", "kesehatan", "sosial", "lingkungan", "keamanan", "lainnya"}
	statuses := []string{"diterima", "diverifikasi", "ditugaskan", "diproses", "selesai", "ditolak"}
	areas := []string{"Kecamatan Ilir Barat I", "Kecamatan Ilir Timur II", "Kecamatan Kemuning", "Kecamatan Plaju", "Kecamatan Sukarami", "Kecamatan Kalidoni"}
	instIDs := []string{"dinas-pu", "dinas-kesehatan", "dinas-sosial", "dlh", "satpol-pp"}

	for i := 0; i < 42; i++ {
		category := categories[i%len(categories)]
		status := statuses[rand.Intn(len(statuses))]
		daysAgo := rand.Intn(60)
		received := time.Now().Add(-time.Duration(daysAgo) * 24 * time.Hour)
		completed := (*time.Time)(nil)
		if status == "selesai" {
			t := received.Add(time.Duration(24+rand.Intn(120)) * time.Hour)
			completed = &t
		}
		var duplicateOf *string
		if i%5 == 0 && i%9 != 0 {
			parentIndex := i - (i % 9)
			if parentIndex >= 0 {
				parent := fmt.Sprintf("LP-%d", 1000+parentIndex)
				duplicateOf = &parent
			}
		}
		lat := -2.9761 + (rand.Float64()-0.5)*0.15
		lng := 104.7754 + (rand.Float64()-0.5)*0.15
		rpt := models.Report{ID: fmt.Sprintf("LP-%d", 1000+i), Kategori: category, LokasiUmum: areas[i%len(areas)], Ringkasan: summaryFor(category), TeksTerredaksi: "Teks lengkap laporan yang hanya disimpan di sisi internal.", KodeLacak: fmt.Sprintf("TRACK-%04d", 1000+i), Status: status, HoaxScore: ptrFloat(rand.Float64()), ButuhReviewManusia: i%7 == 0, ReporterIdentity: ptrString(fmt.Sprintf("internal-%04d", i)), DuplicateOf: duplicateOf, InstitutionID: &instIDs[i%len(instIDs)], Lat: &lat, Lng: &lng, FotoSebelum: maybePhoto(status, i), FotoSesudah: maybeAfter(status, i), ReceivedAt: received, CompletedAt: completed, CreatedAt: received, UpdatedAt: time.Now()}
		gormDB.Where("id = ?", rpt.ID).FirstOrCreate(&rpt)

		statusesForLog := []string{"diterima"}
		for _, next := range []string{"diverifikasi", "ditugaskan", "diproses", "selesai"} {
			if status == next || indexOf(statuses, status) > indexOf(statuses, next) {
				statusesForLog = append(statusesForLog, next)
			}
		}
		if status == "ditolak" {
			statusesForLog = append(statusesForLog, "ditolak")
		}
		for idx, statusLog := range statusesForLog {
			logItem := models.StatusLog{ReportID: rpt.ID, Status: statusLog, Tanggal: received.Add(time.Duration(idx+1) * 6 * time.Hour)}
			gormDB.Where("report_id = ? AND status = ?", rpt.ID, statusLog).FirstOrCreate(&logItem)
		}
	}

	for i := 0; i < 8; i++ {
		week := time.Now().AddDate(0, 0, -7*i)
		week = week.AddDate(0, 0, -int(week.Weekday())+1)
		row := models.WeeklySummary{WeekStart: week.Truncate(24 * time.Hour), Summary: "Jumlah laporan minggu ini relatif stabil, dengan kategori infrastruktur tetap dominan dan waktu respons rata-rata membaik tipis."}
		gormDB.Where("week_start = ?", row.WeekStart).FirstOrCreate(&row)
	}
	log.Println("seed selesai")
}

func indexOf(items []string, value string) int {
	for i, v := range items {
		if v == value {
			return i
		}
	}
	return -1
}
func ptrFloat(v float64) *float64 { return &v }
func ptrString(v string) *string  { return &v }
func summaryFor(category string) string {
	switch category {
	case "infrastruktur":
		return "Jalan berlubang mengganggu lalu lintas kendaraan roda dua dan roda empat."
	case "kesehatan":
		return "Antrean layanan puskesmas dilaporkan tidak sesuai nomor urut."
	case "lingkungan":
		return "Tumpukan sampah belum diangkut lebih dari seminggu."
	case "sosial":
		return "Bantuan sosial belum diterima oleh warga terdaftar di wilayah ini."
	case "keamanan":
		return "Penerangan jalan umum mati sehingga area rawan pada malam hari."
	default:
		return "Laporan warga menunggu tindak lanjut dari instansi terkait."
	}
}
func maybePhoto(status string, i int) *string {
	if status == "selesai" {
		s := fmt.Sprintf("https://picsum.photos/seed/before%d/600/400", i)
		return &s
	}
	return nil
}
func maybeAfter(status string, i int) *string {
	if status == "selesai" {
		s := fmt.Sprintf("https://picsum.photos/seed/after%d/600/400", i)
		return &s
	}
	return nil
}
