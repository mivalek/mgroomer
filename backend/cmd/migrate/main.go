package main

import (
	"log"
	"os"

	mysqlCfg "github.com/go-sql-driver/mysql" // need to rename import to not clash with the one below
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/mysql"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/mivalek/mgroomer/config"
	"github.com/mivalek/mgroomer/db"
)

func main() {
	// create a connection to mySQL db using config params
	db, err := db.NewMySqlStorage(mysqlCfg.Config{
		User: config.Envs.DBUser,
		Passwd: config.Envs.DBPwd,
		Addr: config.Envs.DBAddr,
		DBName: config.Envs.DBName,
		Net: "tcp",
		AllowNativePasswords: true,
		ParseTime: true,
	})
	if err != nil {
		log.Fatal(err)
	}
	// create mySQL driver for the migration
	driver, err := mysql.WithInstance(db, &mysql.Config{})
	if err != nil {
		log.Fatal(err)
	}
	// create Migrate instance from files stored in /migrate/migrations
	m, err := migrate.NewWithDatabaseInstance(
		"file://cmd/migrate/migrations",
		"mysql",
		driver,
	)
	if err != nil {
		log.Fatal(err)
	}
	// get last argument of cmd line command
	cmd := os.Args[len(os.Args) - 1]
	// up-migration
	if cmd == "up" {
		if err := m.Up(); err != nil && err != migrate.ErrNoChange {
			log.Fatal(err)
		}
	}
	// down-migration
	if cmd == "down" {
		if err := m.Down(); err != nil && err != migrate.ErrNoChange {
			log.Fatal(err)
		}

	}
}