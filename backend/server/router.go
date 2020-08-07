package server

import (
	"github.com/gorilla/mux"
	"net/http"
	"peoplemath/storage"
	"time"
)

// Server struct to handle incoming HTTP requests
type Server struct {
	store        storage.StorageService
	storeTimeout time.Duration
}

type Config struct {
	Store        storage.StorageService
	StoreTimeout time.Duration
}

func MakeHandler(c Config) http.Handler {
	s := Server{store: c.Store, storeTimeout: c.StoreTimeout}
	r := mux.NewRouter()

	r.HandleFunc("/api/team/{teamID}", s.handleGetTeam).Methods(http.MethodGet)
	r.HandleFunc("/api/team/", s.handleGetAllTeams).Methods(http.MethodGet)
	r.HandleFunc("/api/team/", s.handlePostTeam).Methods(http.MethodPost)
	r.HandleFunc("/api/team/{teamID}", s.handlePutTeam).Methods(http.MethodPut)

	r.HandleFunc("/api/period/{teamID}/{periodID}", s.handleGetPeriod).Methods(http.MethodGet)
	r.HandleFunc("/api/period/{teamID}/", s.handleGetAllPeriods).Methods(http.MethodGet)
	r.HandleFunc("/api/period/{teamID}/", s.handlePostPeriod).Methods(http.MethodPost)
	r.HandleFunc("/api/period/{teamID}/{periodID}", s.handlePutPeriod).Methods(http.MethodPut)

	r.HandleFunc("/improve", s.handleImprove).Methods(http.MethodGet)

	return r
}
