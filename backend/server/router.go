package server

import (
	"github.com/gorilla/mux"
	"net/http"
	"peoplemath/storage"
	"time"
)

const (
	DefaultStoreTimeout = 5 * time.Second
)

// Server struct to handle incoming HTTP requests
type Server struct {
	store        storage.StorageService
	storeTimeout time.Duration
}

func InitServer(store storage.StorageService, storeTimeout time.Duration) *Server {
	return &Server{
		store:        store,
		storeTimeout: storeTimeout,
	}
}

func MakeHandler(s *Server) http.Handler {
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
