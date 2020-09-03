package server

import (
	"github.com/gorilla/mux"
	"net/http"
	"peoplemath/auth"
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
	auth         auth.Auth
}

func InitServer(store storage.StorageService, storeTimeout time.Duration, auth auth.Auth) *Server {
	return &Server{
		store:        store,
		storeTimeout: storeTimeout,
		auth:         auth,
	}
}

func MakeHandler(s *Server) http.Handler {
	r := mux.NewRouter()

	r.HandleFunc("/api/team/{teamID}", s.auth.Authorize(s.handleGetTeam)).Methods(http.MethodGet)
	r.HandleFunc("/api/team/", s.auth.Authorize(s.handleGetAllTeams)).Methods(http.MethodGet)
	r.HandleFunc("/api/team/", s.auth.Authorize(s.handlePostTeam)).Methods(http.MethodPost)
	r.HandleFunc("/api/team/{teamID}", s.auth.Authorize(s.handlePutTeam)).Methods(http.MethodPut)

	r.HandleFunc("/api/period/{teamID}/{periodID}", s.auth.Authorize(s.handleGetPeriod)).Methods(http.MethodGet)
	r.HandleFunc("/api/period/{teamID}/", s.auth.Authorize(s.handleGetAllPeriods)).Methods(http.MethodGet)
	r.HandleFunc("/api/period/{teamID}/", s.auth.Authorize(s.handlePostPeriod)).Methods(http.MethodPost)
	r.HandleFunc("/api/period/{teamID}/{periodID}", s.auth.Authorize(s.handlePutPeriod)).Methods(http.MethodPut)

	r.HandleFunc("/improve", s.handleImprove).Methods(http.MethodGet)

	return r
}
