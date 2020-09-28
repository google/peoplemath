package controllers

import (
	"net/http"
	"peoplemath/auth"
	"peoplemath/storage"
	"time"

	"github.com/gorilla/mux"
)

// Server struct to handle incoming HTTP requests
type Server struct {
	store        storage.StorageService
	storeTimeout time.Duration
	auth         auth.Auth
}

// MakeServer creates a new instance of the Server
func MakeServer(store storage.StorageService, storeTimeout time.Duration, auth auth.Auth) Server {
	return Server{store: store, storeTimeout: storeTimeout, auth: auth}
}

// MakeHandler creates a http.Handler to deal with HTTP requests for the application.
func (s *Server) MakeHandler() http.Handler {
	r := mux.NewRouter()

	r.HandleFunc("/api/team/{teamID}", s.auth.Authenticate(s.handleGetTeam)).Methods(http.MethodGet)
	r.HandleFunc("/api/team/", s.auth.Authenticate(s.handleGetAllTeams)).Methods(http.MethodGet)
	r.HandleFunc("/api/team/", s.auth.Authenticate(s.handlePostTeam)).Methods(http.MethodPost)
	r.HandleFunc("/api/team/{teamID}", s.auth.Authenticate(s.handlePutTeam)).Methods(http.MethodPut)

	r.HandleFunc("/api/period/{teamID}/{periodID}", s.auth.Authenticate(s.handleGetPeriod)).Methods(http.MethodGet)
	r.HandleFunc("/api/period/{teamID}/", s.auth.Authenticate(s.handleGetAllPeriods)).Methods(http.MethodGet)
	r.HandleFunc("/api/period/{teamID}/", s.auth.Authenticate(s.handlePostPeriod)).Methods(http.MethodPost)
	r.HandleFunc("/api/period/{teamID}/{periodID}", s.auth.Authenticate(s.handlePutPeriod)).Methods(http.MethodPut)

	r.HandleFunc("/improve", s.handleImprove).Methods(http.MethodGet)

	return r
}
