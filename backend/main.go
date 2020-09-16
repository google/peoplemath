// Copyright 2019-2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"reflect"
	"time"

	firebase "firebase.google.com/go/v4"
	"github.com/gorilla/mux"

	"peoplemath/auth"
	"peoplemath/google_cds_store"
	"peoplemath/in_memory_storage"
	"peoplemath/models"
	"peoplemath/storage"

	"github.com/google/uuid"
)

const (
	defaultStoreTimeout = 5 * time.Second
	defaultAuthTimeout  = 5 * time.Second
)

// Server struct to handle incoming HTTP requests
type Server struct {
	store        storage.StorageService
	storeTimeout time.Duration
	auth         auth.Auth
}

func (s *Server) makeHandler() http.Handler {
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

func (s *Server) ensureTeamExistence(w http.ResponseWriter, r *http.Request, teamID string, expected bool) (models.Team, bool) {
	ctx, cancel := context.WithTimeout(r.Context(), s.storeTimeout)
	defer cancel()
	team, exists, err := s.store.GetTeam(ctx, teamID)
	if err != nil {
		log.Printf("Could not validate existence of team '%s': error: %s", teamID, err)
		http.Error(w, fmt.Sprintf("Could not validate existence of team '%s' (see server log)", teamID), http.StatusInternalServerError)
		return models.Team{}, false
	}
	if exists != expected {
		statusCode := http.StatusBadRequest
		if expected {
			statusCode = http.StatusNotFound
		}
		http.Error(w, fmt.Sprintf("Team with ID '%s' expected exists=%v, found %v", teamID, expected, exists), statusCode)
		return models.Team{}, false
	}
	return team, true
}

func (s *Server) ensurePeriodExistence(w http.ResponseWriter, r *http.Request, teamID, periodID string, expected bool) (models.Period, bool) {
	ctx, cancel := context.WithTimeout(r.Context(), s.storeTimeout)
	defer cancel()
	period, exists, err := s.store.GetPeriod(ctx, teamID, periodID)
	if err != nil {
		log.Printf("Could not validate existence of period '%s' for team '%s': error: %s", periodID, teamID, err)
		http.Error(w, fmt.Sprintf("Could not validate existence of period '%s' for team '%s' (see server log)", periodID, teamID), http.StatusInternalServerError)
		return period, false
	}
	if exists != expected {
		statusCode := http.StatusBadRequest
		if expected {
			statusCode = http.StatusNotFound
		}
		http.Error(w, fmt.Sprintf("Period '%s' for team '%s' expected exists=%v, found %v", periodID, teamID, expected, exists), statusCode)
		return period, false
	}
	return period, true
}

func (s *Server) ensureNoConcurrentMod(w http.ResponseWriter, r *http.Request, period, savedPeriod models.Period) bool {
	if savedPeriod.LastUpdateUUID != period.LastUpdateUUID {
		msg := fmt.Sprintf("Concurrent modification: last saved UUID=%s, your last loaded UUID=%s",
			savedPeriod.LastUpdateUUID, period.LastUpdateUUID)
		http.Error(w, msg, http.StatusConflict)

		return false
	}
	return true
}

func (s *Server) handleGetAllTeams(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), s.storeTimeout)
	defer cancel()
	settings, err := s.store.GetSettings(ctx)
	if err != nil {
		log.Printf("Could not retrieve settings: %v", err)
		http.Error(w, "Could not retrieve due to internal server error", http.StatusInternalServerError)
		return
	}
	permissions := settings.GeneralPermissions
	user := r.Context().Value(auth.ContextKey("user")).(models.User)
	if s.auth.CanActOnTeamList(user, permissions, auth.ActionRead) {
		teams, err := s.store.GetAllTeams(ctx)
		if err != nil {
			log.Printf("Could not retrieve teams: error: %s", err)
			http.Error(w, "Could not retrieve teams (see server log)", http.StatusInternalServerError)
			return
		}
		enc := json.NewEncoder(w)
		w.Header().Set("Content-Type", "application/json")
		userCanAddTeam := s.auth.CanActOnTeamList(user, permissions, auth.ActionWrite)
		teamList := models.TeamList{Teams: teams, CanAddTeam: userCanAddTeam}
		enc.Encode(teamList)
	} else {
		http.Error(w, "You are not authorized to view the team list.", http.StatusForbidden)
	}
}

func (s *Server) handleGetTeam(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	teamID := vars["teamID"]
	ctx, cancel := context.WithTimeout(r.Context(), s.storeTimeout)
	defer cancel()
	team, found, err := s.store.GetTeam(ctx, teamID)
	if err != nil {
		log.Printf("Could not retrieve team '%s': error: %s", teamID, err)
		http.Error(w, fmt.Sprintf("Could not retrieve team '%s' (see server log)", teamID), http.StatusInternalServerError)
		return
	}
	if !found {
		http.NotFound(w, r)
		return
	}

	user := r.Context().Value(auth.ContextKey("user")).(models.User)
	if s.auth.CanActOnTeam(user, team, auth.ActionRead) {
		enc := json.NewEncoder(w)
		w.Header().Set("Content-Type", "application/json")
		enc.Encode(team)
	} else {
		http.Error(w, "You are not authorized to view this team.", http.StatusForbidden)
	}
}

func (s *Server) handlePostTeam(w http.ResponseWriter, r *http.Request) {
	team, ok := readTeamFromBody(w, r)
	if !ok {
		return
	}
	_, isNew := s.ensureTeamExistence(w, r, team.ID, false)
	if !isNew {
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), s.storeTimeout)
	defer cancel()
	settings, err := s.store.GetSettings(ctx)
	if err != nil {
		log.Printf("Could not get settings: %v", err)
		http.Error(w, "The team could not be created because of an internal server error", http.StatusInternalServerError)
		return
	}
	permissions := settings.GeneralPermissions
	user := r.Context().Value(auth.ContextKey("user")).(models.User)
	if s.auth.CanActOnTeamList(user, permissions, auth.ActionWrite) {
		if reflect.DeepEqual(team.Permissions, models.TeamPermissions{}) {
			team.Permissions.Read = permissions.ReadTeamList
			team.Permissions.Write = permissions.AddTeam
		}

		err := s.store.CreateTeam(ctx, team)
		if err != nil {
			log.Printf("Could not create team: error: %s", err)
			http.Error(w, "Could not create team (see server log)", http.StatusInternalServerError)
			return
		}
	} else {
		http.Error(w, "You are not authorized to create a new team.", http.StatusForbidden)
	}
}

func (s *Server) handlePutTeam(w http.ResponseWriter, r *http.Request) {
	updatedTeam, ok := readTeamFromBody(w, r)
	if !ok {
		return
	}
	team, exists := s.ensureTeamExistence(w, r, updatedTeam.ID, true)
	if !exists {
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), s.storeTimeout)
	defer cancel()

	user := r.Context().Value(auth.ContextKey("user")).(models.User)
	if s.auth.CanActOnTeam(user, team, auth.ActionWrite) {
		err := s.store.UpdateTeam(ctx, updatedTeam)
		if err != nil {
			log.Printf("Could not update team: error: %s", err)
			http.Error(w, "Could not update team (see server log)", http.StatusInternalServerError)
			return
		}
	} else {
		http.Error(w, "You are not authorized to edit this team.", http.StatusForbidden)
	}
}

func readTeamFromBody(w http.ResponseWriter, r *http.Request) (models.Team, bool) {
	dec := json.NewDecoder(r.Body)
	team := models.Team{}
	err := dec.Decode(&team)
	if err != nil {
		http.Error(w, fmt.Sprintf("Could not decode body: %v", err), http.StatusBadRequest)
		return team, false
	}
	return team, true
}

func (s *Server) handleGetAllPeriods(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	teamID := vars["teamID"]
	ctx, cancel := context.WithTimeout(r.Context(), s.storeTimeout)
	defer cancel()

	team, found, err := s.store.GetTeam(ctx, teamID)
	if err != nil {
		log.Printf("Could not retrieve team: %v", err)
		http.Error(w, "Could not retrieve team", http.StatusInternalServerError)
		return
	}
	if !found {
		http.NotFound(w, r)
		return
	}
	user := r.Context().Value(auth.ContextKey("user")).(models.User)
	if s.auth.CanActOnTeam(user, team, auth.ActionRead) {
		periods, found, err := s.store.GetAllPeriods(ctx, teamID)
		if err != nil {
			log.Printf("Could not retrieve periods for team '%s': error: %s", teamID, err)
			http.Error(w, fmt.Sprintf("Could not retrieve periods for team '%s' (see server log)", teamID), http.StatusInternalServerError)
			return
		}
		if !found {
			http.NotFound(w, r)
			return
		}
		enc := json.NewEncoder(w)
		w.Header().Set("Content-Type", "application/json")
		enc.Encode(periods)
	} else {
		http.Error(w, "You are not authorized to view this team's periods.", http.StatusForbidden)
	}
}

func (s *Server) handleGetPeriod(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	teamID := vars["teamID"]
	periodID := vars["periodID"]
	ctx, cancel := context.WithTimeout(r.Context(), s.storeTimeout)
	defer cancel()

	team, found, err := s.store.GetTeam(ctx, teamID)
	if err != nil {
		log.Printf("Could not retrieve team: %v", err)
		http.Error(w, "Could not retrieve team", http.StatusInternalServerError)
		return
	}
	if !found {
		http.NotFound(w, r)
		return
	}
	user := r.Context().Value(auth.ContextKey("user")).(models.User)
	if s.auth.CanActOnTeam(user, team, auth.ActionRead) {
		period, found, err := s.store.GetPeriod(ctx, teamID, periodID)
		if err != nil {
			log.Printf("Could not retrieve period '%s' for team '%s': error: %s", periodID, teamID, err)
			http.Error(w, fmt.Sprintf("Could not retrieve period '%s' for team '%s' (see server log)", periodID, teamID), http.StatusInternalServerError)
			return
		}
		if !found {
			http.NotFound(w, r)
			return
		}
		enc := json.NewEncoder(w)
		w.Header().Set("Content-Type", "application/json")
		enc.Encode(period)
	} else {
		http.Error(w, "You are not authorized to view this team's periods.", http.StatusForbidden)
	}
}

func (s *Server) writePeriodUpdateResponse(w http.ResponseWriter, r *http.Request, period models.Period) {
	response := models.ObjectUpdateResponse{LastUpdateUUID: period.LastUpdateUUID}
	enc := json.NewEncoder(w)
	w.Header().Set("Content-Type", "application/json")
	enc.Encode(response)
}

func (s *Server) handlePostPeriod(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	teamID := vars["teamID"]
	period, ok := readPeriodFromBody(w, r)
	if !ok {
		return
	}
	team, exists := s.ensureTeamExistence(w, r, teamID, true)
	if !exists {
		return
	}
	if _, ok := s.ensurePeriodExistence(w, r, teamID, period.ID, false); !ok {
		return
	}
	period.LastUpdateUUID = uuid.New().String()
	ctx, cancel := context.WithTimeout(r.Context(), s.storeTimeout)
	defer cancel()

	user := r.Context().Value(auth.ContextKey("user")).(models.User)
	if s.auth.CanActOnTeam(user, team, auth.ActionWrite) {
		err := s.store.CreatePeriod(ctx, teamID, period)
		if err != nil {
			log.Printf("Could not create period for team '%s': error: %s", teamID, err)
			http.Error(w, fmt.Sprintf("Could not create period for team '%s' (see server log)", teamID), http.StatusInternalServerError)
			return
		}
		s.writePeriodUpdateResponse(w, r, period)
	} else {
		http.Error(w, "You are not authorized to add new periods for this team.", http.StatusForbidden)
	}
}

func (s *Server) handlePutPeriod(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	teamID := vars["teamID"]
	periodID := vars["periodID"]
	period, ok := readPeriodFromBody(w, r)
	if !ok {
		return
	}
	team, exists := s.ensureTeamExistence(w, r, teamID, true)
	if !exists {
		return
	}
	savedPeriod, ok := s.ensurePeriodExistence(w, r, teamID, periodID, true)
	if !ok || !s.ensureNoConcurrentMod(w, r, period, savedPeriod) {
		return
	}
	period.LastUpdateUUID = uuid.New().String()
	ctx, cancel := context.WithTimeout(r.Context(), s.storeTimeout)
	defer cancel()

	user := r.Context().Value(auth.ContextKey("user")).(models.User)
	if s.auth.CanActOnTeam(user, team, auth.ActionWrite) {
		err := s.store.UpdatePeriod(ctx, teamID, period)
		if err != nil {
			log.Printf("Could not update period '%s' for team '%s': error: %s", periodID, teamID, err)
			http.Error(w, fmt.Sprintf("Could not update period '%s' for team '%s' (see server log)", periodID, teamID), http.StatusInternalServerError)
			return
		}
		s.writePeriodUpdateResponse(w, r, period)
	} else {
		http.Error(w, "You are not authorized to edit this team's periods.", http.StatusForbidden)
	}
}

func readPeriodFromBody(w http.ResponseWriter, r *http.Request) (models.Period, bool) {
	dec := json.NewDecoder(r.Body)
	period := models.Period{}
	err := dec.Decode(&period)
	if err != nil {
		http.Error(w, fmt.Sprintf("Could not decode body: %v", err), http.StatusBadRequest)
		return period, false
	}
	for _, bucket := range period.Buckets {
		for _, objective := range bucket.Objectives {
			if objective.CommitmentType != "" {
				if objective.CommitmentType != models.CommitmentTypeCommitted && objective.CommitmentType != models.CommitmentTypeAspirational {
					http.Error(w, fmt.Sprintf("Illegal commitment type '%s'", objective.CommitmentType), http.StatusBadRequest)
					return period, false
				}
			}
		}
	}
	return period, true
}

func (s *Server) handleImprove(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), s.storeTimeout)
	defer cancel()
	settings, err := s.store.GetSettings(ctx)
	if err != nil {
		log.Printf("Could not retrieve settings: %v", err)
		http.Error(w, "Could not retrieve settings", http.StatusInternalServerError)
		return
	}
	http.Redirect(w, r, settings.ImproveURL, http.StatusFound)
}

func main() {
	var useInMemStore bool
	var authMode string
	var defaultDomain string
	flag.BoolVar(&useInMemStore, "inmemstore", false, "Use in-memory datastore")
	flag.StringVar(&defaultDomain, "defaultdomain", "google.com", "When using inmemstore: the domain that all team permissions are defaulted to")
	flag.StringVar(&authMode, "authmode", "none", "Set authentication mode, either 'none' or 'firebase'")
	flag.Parse()

	var store storage.StorageService
	if useInMemStore {
		log.Printf("Using in-memory store per command-line flag")
		store = in_memory_storage.MakeInMemStore(defaultDomain)
	} else {
		gcloudProject := os.Getenv("GOOGLE_CLOUD_PROJECT")
		if gcloudProject == "" {
			log.Fatalf("GOOGLE_CLOUD_PROJECT not set")
			return
		}
		log.Printf("Using Cloud Datastore storage service; project='%s'", gcloudProject)
		log.Printf("To use the local emulator, see https://cloud.google.com/datastore/docs/tools/datastore-emulator")
		ctx := context.Background()
		var err error
		store, err = google_cds_store.MakeGoogleCDSStore(ctx, gcloudProject)
		if err != nil {
			log.Fatalf("Could not instantiate datastore: %s", err)
			return
		}
	}

	var authProvider auth.Auth

	if authMode == "none" {
		authProvider = auth.NoAuth{}
	} else if authMode == "firebase" {
		log.Printf("Using firebase authentication per command-line flag")
		ctx := context.Background()
		app, err := firebase.NewApp(ctx, nil)
		if err != nil {
			log.Fatalf("Could not instantiate Firebase app: %v\n", err)
			return
		}
		firebaseClient, err := app.Auth(ctx)
		if err != nil {
			log.Fatalf("Could not get Firebase Auth client: %v\n", err)
			return
		}
		firebaseAuth := &auth.FirebaseAuth{
			FirebaseClient: firebaseClient,
			AuthTimeout:    defaultAuthTimeout,
		}
		authProvider = firebaseAuth
	} else {
		log.Fatalf("%s is not a supported authMode. Supported are 'none' and 'firebase'.", authMode)
	}

	server := Server{store: store, storeTimeout: defaultStoreTimeout, auth: authProvider}

	handler := server.makeHandler()
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
		log.Printf("Defaulting to port %s", port)
	}
	log.Printf("Listening on port %s", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), handler))
}
