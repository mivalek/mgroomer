package api

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/mivalek/mgroomer/config"
	"github.com/mivalek/mgroomer/service/athlete"
	"github.com/mivalek/mgroomer/service/files"
)

type ApiServer struct {
	addr string
	db   *sql.DB
}

// constructor for ApiServer struct
func NewApiServer(addr string, db *sql.DB) *ApiServer {
	return &ApiServer{
		addr: addr,
		db: db,
	}
}

// Run() method receives *ApiServer
func (s *ApiServer) Run() error {
	router := mux.NewRouter()
	headersOk := handlers.AllowedHeaders([]string{"X-Requested-With", "Authorization", "Content-Type"})
	// originsOk := handlers.AllowedOrigins([]string{"*"})
	originsOk := handlers.AllowedOrigins([]string{fmt.Sprintf("%s:%s", config.Envs.PublicHost, config.Envs.ClientPort)})
	methodsOk := handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "OPTIONS", "DELETE"})
	router.Use(handlers.CORS())

	// only handle /api/v1 routes
	subrouter := router.PathPrefix("/api/v1").Subrouter()

	athleteStore := athlete.NewStore(s.db)
	athleteHandler := athlete.NewHandler(athleteStore)
	athleteHandler.RegisterRoutes(subrouter)

	fileStore := files.NewStore(s.db)
	fileHandler := files.NewHandler(fileStore, athleteStore)
	fileHandler.RegisterRoutes(subrouter)

    http.Handle("/", router)
	log.Println("listening on", s.addr)
	return http.ListenAndServe(s.addr, handlers.CORS(originsOk, headersOk, methodsOk)(router))
}