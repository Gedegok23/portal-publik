package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port            string
	DatabaseURL     string
	CORSOrigins     []string
	DefaultPageSize int
	MaxPageSize     int
}

func Load() Config {
	return Config{
		Port:            getEnv("APP_PORT", "8080"),
		DatabaseURL:     getEnv("DATABASE_URL", "postgres://portal:portal@localhost:5432/portal_publik?sslmode=disable"),
		CORSOrigins:     splitCSV(getEnv("CORS_ORIGINS", "http://localhost:3000")),
		DefaultPageSize: getInt("DEFAULT_PAGE_SIZE", 9),
		MaxPageSize:     getInt("MAX_PAGE_SIZE", 100),
	}
}

func getEnv(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

func getInt(key string, fallback int) int {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}
	i, err := strconv.Atoi(v)
	if err != nil || i <= 0 {
		return fallback
	}
	return i
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		if p := strings.TrimSpace(part); p != "" {
			out = append(out, p)
		}
	}
	return out
}
