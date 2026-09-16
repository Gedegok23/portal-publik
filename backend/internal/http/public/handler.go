package public

import (
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct {
	DB          *gorm.DB
	DefaultPage int
	MaxPage     int
}

type statusLogResponse struct {
	Status  string    `json:"status"`
	Tanggal time.Time `json:"tanggal"`
}

type laporanSummaryResponse struct {
	ID           string    `json:"id"`
	Kategori     string    `json:"kategori"`
	LokasiUmum   string    `json:"lokasi_umum"`
	Ringkasan    string    `json:"ringkasan"`
	Status       string    `json:"status"`
	DuplicateOf  *string   `json:"duplicate_of"`
	JumlahSerupa int64     `json:"jumlah_serupa"`
	Tanggal      time.Time `json:"tanggal"`
}

type laporanDetailResponse struct {
	laporanSummaryResponse
	StatusLog   []statusLogResponse `json:"status_log"`
	FotoSebelum *string             `json:"foto_sebelum"`
	FotoSesudah *string             `json:"foto_sesudah"`
}

type paginatedResponse struct {
	Data       []laporanSummaryResponse `json:"data"`
	Page       int                      `json:"page"`
	PerPage    int                      `json:"per_page"`
	Total      int64                    `json:"total"`
	TotalPages int                      `json:"total_pages"`
}

type mapPointResponse struct {
	ID        string  `json:"id"`
	Kategori  string  `json:"kategori"`
	Status    string  `json:"status"`
	Ringkasan string  `json:"ringkasan"`
	Lat       float64 `json:"lat"`
	Lng       float64 `json:"lng"`
}

type scorecardRow struct {
	InstansiID              string  `json:"instansi_id"`
	NamaInstansi            string  `json:"nama_instansi"`
	JumlahDitangani         int64   `json:"jumlah_ditangani"`
	RataRataResponsJam      float64 `json:"rata_rata_respons_jam"`
	RataRataPenyelesaianJam float64 `json:"rata_rata_penyelesaian_jam"`
}

type trenKategori struct {
	Kategori string `json:"kategori"`
	Jumlah   int64  `json:"jumlah"`
}

type trenPeriode struct {
	Periode string `json:"periode"`
	Jumlah  int64  `json:"jumlah"`
}

type trenResponse struct {
	PerKategori      []trenKategori `json:"per_kategori"`
	PerPeriode       []trenPeriode  `json:"per_periode"`
	RingkasanNaratif string         `json:"ringkasan_naratif"`
}

type cekStatusResponse struct {
	Ditemukan bool                `json:"ditemukan"`
	Status    string              `json:"status,omitempty"`
	Kategori  string              `json:"kategori,omitempty"`
	StatusLog []statusLogResponse `json:"status_log,omitempty"`
}

type statistikResponse struct {
	TotalLaporan       int64   `json:"total_laporan"`
	JumlahSelesai      int64   `json:"jumlah_selesai"`
	RataRataResponsJam float64 `json:"rata_rata_respons_jam"`
}

func (h *Handler) Register(r *gin.RouterGroup) {
	r.GET("/laporan", h.listLaporan)
	r.GET("/laporan/map", h.mapLaporan)
	r.GET("/laporan/:id", h.detailLaporan)
	r.GET("/scorecard", h.scorecard)
	r.GET("/tren", h.tren)
	r.GET("/cek-status", h.cekStatus)
	// Small aggregate endpoint used by the existing frontend homepage.
	r.GET("/statistik", h.statistik)
}

func (h *Handler) listLaporan(c *gin.Context) {
	page := positiveInt(c.Query("page"), 1)
	perPage := h.DefaultPage
	if perPage <= 0 {
		perPage = 9
	}
	if raw := strings.TrimSpace(c.Query("per_page")); raw != "" {
		if n, err := strconv.Atoi(raw); err == nil && n > 0 {
			perPage = n
			if h.MaxPage > 0 && perPage > h.MaxPage {
				perPage = h.MaxPage
			}
		}
	}
	kategori := strings.TrimSpace(c.Query("kategori"))
	wilayah := strings.TrimSpace(c.Query("wilayah"))
	status := strings.TrimSpace(c.Query("status"))
	q := strings.TrimSpace(c.Query("q"))
	sortBy := strings.TrimSpace(c.Query("sort"))
	if sortBy == "" {
		sortBy = "terbaru"
	}
	if sortBy != "terbaru" && sortBy != "urgensi" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "sort harus terbaru atau urgensi"})
		return
	}

	query := h.DB.Table("reports AS r")
	query = applyReportFilters(query, kategori, wilayah, status, q)

	var total int64
	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal menghitung laporan"})
		return
	}
	order := "r.created_at DESC"
	if sortBy == "urgensi" {
		order = `(SELECT COUNT(*) FROM reports d WHERE d.duplicate_of = r.id) DESC, r.created_at DESC`
	}

	var rows []struct {
		ID           string
		Kategori     string
		LokasiUmum   string
		Ringkasan    string
		Status       string
		DuplicateOf  *string
		JumlahSerupa int64
		Tanggal      time.Time
	}
	offset := (page - 1) * perPage
	err := query.Select(`r.id, r.kategori, r.lokasi_umum, r.ringkasan, r.status, r.duplicate_of, r.created_at AS tanggal,
		(SELECT COUNT(*) FROM reports d WHERE d.duplicate_of = r.id) AS jumlah_serupa`).
		Order(order).Offset(offset).Limit(perPage).Find(&rows).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal mengambil laporan"})
		return
	}

	data := make([]laporanSummaryResponse, 0, len(rows))
	for _, row := range rows {
		data = append(data, laporanSummaryResponse{ID: row.ID, Kategori: row.Kategori, LokasiUmum: row.LokasiUmum, Ringkasan: row.Ringkasan, Status: row.Status, DuplicateOf: row.DuplicateOf, JumlahSerupa: row.JumlahSerupa, Tanggal: row.Tanggal})
	}
	c.JSON(http.StatusOK, paginatedResponse{Data: data, Page: page, PerPage: perPage, Total: total, TotalPages: maxInt(1, int(math.Ceil(float64(total)/float64(perPage))))})
}

func (h *Handler) mapLaporan(c *gin.Context) {
	query := h.DB.Table("reports AS r").Select("r.id, r.kategori, r.status, r.ringkasan, r.lat, r.lng").Where("r.lat IS NOT NULL AND r.lng IS NOT NULL")
	query = applyReportFilters(query, strings.TrimSpace(c.Query("kategori")), strings.TrimSpace(c.Query("wilayah")), strings.TrimSpace(c.Query("status")), strings.TrimSpace(c.Query("q")))
	var rows []mapPointResponse
	if err := query.Order("r.created_at DESC").Find(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal mengambil titik peta"})
		return
	}
	c.JSON(http.StatusOK, rows)
}

func (h *Handler) detailLaporan(c *gin.Context) {
	id := strings.TrimSpace(c.Param("id"))
	var row struct {
		ID           string
		Kategori     string
		LokasiUmum   string
		Ringkasan    string
		Status       string
		DuplicateOf  *string
		JumlahSerupa int64
		Tanggal      time.Time
		FotoSebelum  *string
		FotoSesudah  *string
	}
	err := h.DB.Table("reports AS r").Select(`r.id, r.kategori, r.lokasi_umum, r.ringkasan, r.status, r.duplicate_of, r.created_at AS tanggal, r.foto_sebelum, r.foto_sesudah,
		(SELECT COUNT(*) FROM reports d WHERE d.duplicate_of = r.id) AS jumlah_serupa`).Where("r.id = ?", id).First(&row).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "laporan tidak ditemukan"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal mengambil detail laporan"})
		return
	}

	var logs []statusLogResponse
	if err := h.DB.Table("status_logs").Select("status, tanggal").Where("report_id = ?", id).Order("tanggal ASC").Find(&logs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal mengambil timeline status"})
		return
	}

	c.JSON(http.StatusOK, laporanDetailResponse{
		laporanSummaryResponse: laporanSummaryResponse{ID: row.ID, Kategori: row.Kategori, LokasiUmum: row.LokasiUmum, Ringkasan: row.Ringkasan, Status: row.Status, DuplicateOf: row.DuplicateOf, JumlahSerupa: row.JumlahSerupa, Tanggal: row.Tanggal},
		StatusLog:              logs,
		FotoSebelum:            row.FotoSebelum,
		FotoSesudah:            row.FotoSesudah,
	})
}

func (h *Handler) scorecard(c *gin.Context) {
	var rows []scorecardRow
	err := h.DB.Table("reports AS r").Select(`
		i.id AS instansi_id,
		i.nama AS nama_instansi,
		COUNT(r.id) AS jumlah_ditangani,
		COALESCE(AVG(EXTRACT(EPOCH FROM (COALESCE((SELECT MIN(sl.tanggal) FROM status_logs sl WHERE sl.report_id = r.id AND sl.status <> 'diterima'), r.received_at) - r.received_at)) / 3600), 0) AS rata_rata_respons_jam,
		COALESCE(AVG(CASE WHEN r.completed_at IS NOT NULL THEN EXTRACT(EPOCH FROM (r.completed_at - r.received_at)) / 3600 END), 0) AS rata_rata_penyelesaian_jam
	`).Joins("JOIN institutions i ON i.id = r.institution_id").Group("i.id, i.nama").Order("rata_rata_penyelesaian_jam ASC, i.nama ASC").Scan(&rows).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal mengambil scorecard"})
		return
	}
	for i := range rows {
		rows[i].RataRataResponsJam = round2(rows[i].RataRataResponsJam)
		rows[i].RataRataPenyelesaianJam = round2(rows[i].RataRataPenyelesaianJam)
	}
	c.JSON(http.StatusOK, rows)
}

func (h *Handler) tren(c *gin.Context) {
	var perKategori []trenKategori
	if err := h.DB.Table("reports").Select("kategori, COUNT(*) AS jumlah").Group("kategori").Order("kategori ASC").Scan(&perKategori).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal mengambil tren kategori"})
		return
	}

	var perPeriode []trenPeriode
	if err := h.DB.Raw(`SELECT TO_CHAR(DATE_TRUNC('week', created_at), 'IYYY-"W"IW') AS periode, COUNT(*) AS jumlah FROM reports GROUP BY 1 ORDER BY 1 ASC`).Scan(&perPeriode).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal mengambil tren periode"})
		return
	}

	var latest struct{ Summary string }
	_ = h.DB.Table("weekly_summaries").Select("summary").Order("week_start DESC").Limit(1).Scan(&latest).Error
	if latest.Summary == "" {
		latest.Summary = "Belum ada ringkasan mingguan."
	}
	c.JSON(http.StatusOK, trenResponse{PerKategori: perKategori, PerPeriode: perPeriode, RingkasanNaratif: latest.Summary})
}

func (h *Handler) cekStatus(c *gin.Context) {
	kode := strings.TrimSpace(c.Query("kode"))
	if kode == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "parameter kode wajib diisi"})
		return
	}
	var row struct {
		Status   string
		Kategori string
		ID       string
	}
	if err := h.DB.Table("reports").Select("id, status, kategori").Where("LOWER(kode_lacak) = LOWER(?)", kode).First(&row).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusOK, cekStatusResponse{Ditemukan: false})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal memeriksa status"})
		return
	}
	var logs []statusLogResponse
	if err := h.DB.Table("status_logs").Select("status, tanggal").Where("report_id = ?", row.ID).Order("tanggal ASC").Find(&logs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal mengambil status"})
		return
	}
	c.JSON(http.StatusOK, cekStatusResponse{Ditemukan: true, Status: row.Status, Kategori: row.Kategori, StatusLog: logs})
}

func (h *Handler) statistik(c *gin.Context) {
	var total int64
	var selesai int64
	if err := h.DB.Table("reports").Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal menghitung total laporan"})
		return
	}
	if err := h.DB.Table("reports").Where("status = ?", "selesai").Count(&selesai).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal menghitung laporan selesai"})
		return
	}
	var avg *float64
	_ = h.DB.Raw(`SELECT AVG(EXTRACT(EPOCH FROM (first_response - received_at)) / 3600) FROM (SELECT r.received_at, COALESCE(MIN(sl.tanggal), r.received_at) AS first_response FROM reports r LEFT JOIN status_logs sl ON sl.report_id = r.id AND sl.status <> 'diterima' GROUP BY r.id, r.received_at) q WHERE first_response >= received_at`).Scan(&avg).Error
	value := 0.0
	if avg != nil {
		value = round2(*avg)
	}
	c.JSON(http.StatusOK, statistikResponse{TotalLaporan: total, JumlahSelesai: selesai, RataRataResponsJam: value})
}

func applyReportFilters(query *gorm.DB, kategori, wilayah, status, q string) *gorm.DB {
	if kategori != "" {
		query = query.Where("r.kategori = ?", kategori)
	}
	if wilayah != "" {
		query = query.Where("r.lokasi_umum = ?", wilayah)
	}
	if status != "" {
		query = query.Where("r.status = ?", status)
	}
	if q != "" {
		needle := "%" + strings.ToLower(q) + "%"
		query = query.Where("LOWER(r.ringkasan) LIKE ? OR LOWER(r.lokasi_umum) LIKE ? OR LOWER(r.kategori) LIKE ?", needle, needle, needle)
	}
	return query
}

func positiveInt(value string, fallback int) int {
	i, err := strconv.Atoi(value)
	if err != nil || i < 1 {
		return fallback
	}
	return i
}
func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}
func round2(value float64) float64 { return math.Round(value*100) / 100 }
