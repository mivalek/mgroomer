package db

import (
	"database/sql"
	"log"

	"github.com/go-sql-driver/mysql"
)

// creates a connection to mySQL database based on a config struct
func NewMySqlStorage(cfg mysql.Config) (*sql.DB, error) {
	db, err := sql.Open("mysql", cfg.FormatDSN())

	if err != nil {
		log.Fatal(err)
	}

	return db, nil
}