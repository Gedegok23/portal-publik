package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"portal-publik/backend/internal/config"
	"portal-publik/backend/internal/db"
	publichttp "portal-publik/backend/internal/http/public"
)

func main() {
	cfg := config.Load()
	gormDB, err := db.Open(cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}

	h := &publichttp.Handler{DB: gormDB, DefaultPage: cfg.DefaultPageSize, MaxPage: cfg.MaxPageSize}
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery(), publichttp.CORSMiddleware(cfg.CORSOrigins), publichttp.NoStoreSensitiveResponse())
	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })
	publicGroup := r.Group("/api/public")
	h.Register(publicGroup)

	log.Printf("portal publik API listening on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
