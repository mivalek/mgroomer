package main

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/go-sql-driver/mysql"
	"github.com/mivalek/mgroomer/cmd/api"
	"github.com/mivalek/mgroomer/config"
	"github.com/mivalek/mgroomer/db"
)

func initStorage(db *sql.DB) {
	err := db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	log.Println("DB successfully connected!")
}

func main() {
	// create a connection to mySQL db using config params
	db, err := db.NewMySqlStorage(mysql.Config{
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

	// test connection
	initStorage(db)

	// start server
	server := api.NewApiServer(fmt.Sprintf(":%s", config.Envs.Port), db)
	if err := server.Run(); err != nil {
		log.Fatal(err)
	}
}