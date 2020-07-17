package server

import (
	"github.com/gorilla/mux"
	"log"
	"net/http"
	"os"
	"peoplemath/controllers"
	"time"
)

const (
	defaultWriteTimout = 5 * time.Second
	defaultReadTimeout = 5 * time.Second
)

func MakeHandler() http.Handler {
	m := mux.NewRouter()

	teamController := controllers.GetTeamController()
	m.HandleFunc("/api/team/", teamController.GetList).Methods("GET")
	m.HandleFunc("/api/team/{id}", teamController.Get).Methods("GET")
	m.HandleFunc("/api/team/", teamController.Post).Methods("POST")
	m.HandleFunc("/api/team/", teamController.Put).Methods("PUT")

	periodController := controllers.GetPeriodController()
	m.HandleFunc("/api/period/{teamID}/{periodID}", periodController.Get).Methods("GET")
	m.HandleFunc("/api/period/{teamID}/{periodID}", periodController.Put).Methods("PUT")
	// TODO periodId not required for this endpoint, need refactor
	m.HandleFunc("/api/period/{teamID}/{periodID}", periodController.GetList).Methods("GET")

	m.HandleFunc("/api/period/{teamID}/", periodController.Post).Methods("POST")

	improveController := controllers.GetImproveController()
	m.HandleFunc("/improve", improveController.Get).Methods("GET")

	return m
}

func InitServer(handler http.Handler) *http.Server {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
		log.Printf("Defaulting to port %s", port)
	}
	log.Printf("Listening on port %s", port)

	return &http.Server{
		Handler: handler,
		Addr:    "127.0.0.1:" + port,
		// Good practice: enforce timeouts for servers you create!
		WriteTimeout: defaultWriteTimout,
		ReadTimeout:  defaultReadTimeout,
	}
}
