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
	"strings"
	"time"

	"github.com/google/uuid"
)

const (
	defaultStoreTimeout = 5 * time.Second
)

// Team model struct
type Team struct {
	ID          string `json:"id"`
	DisplayName string `json:"displayName"`
}

// Period model struct
type Period struct {
	ID                     string   `json:"id"`
	DisplayName            string   `json:"displayName"`
	Unit                   string   `json:"unit"`
	NotesURL               string   `json:"notesURL"`
	MaxCommittedPercentage float64  `json:"maxCommittedPercentage"`
	Buckets                []Bucket `json:"buckets"`
	People                 []Person `json:"people"`
	// UUID for simple optimistic concurrency control
	LastUpdateUUID string `json:"lastUpdateUUID"`
}

// Bucket model struct
type Bucket struct {
	DisplayName          string      `json:"displayName"`
	AllocationPercentage float64     `json:"allocationPercentage"`
	Objectives           []Objective `json:"objectives"`
}

// Objective model struct
type Objective struct {
	Name             string           `json:"name"`
	ResourceEstimate float64          `json:"resourceEstimate"`
	Assignments      []Assignment     `json:"assignments"`
	CommitmentType   string           `json:"commitmentType"`
	Notes            string           `json:"notes"`
	Groups           []ObjectiveGroup `json:"groups"`
	Tags             []ObjectiveTag   `json:"tags"`
}

// ObjectiveGroup model struct
type ObjectiveGroup struct {
	GroupType string `json:"groupType"`
	GroupName string `json:"groupName"`
}

// ObjectiveTag model struct
type ObjectiveTag struct {
	Name string `json:"name"`
}

// Valid commitment types for assignments
const (
	CommitmentTypeAspirational = "Aspirational"
	CommitmentTypeCommitted    = "Committed"
)

// Assignment model struct
type Assignment struct {
	PersonID   string  `json:"personId"`
	Commitment float64 `json:"commitment"`
}

// Person model struct
type Person struct {
	ID           string  `json:"id"`
	DisplayName  string  `json:"displayName"`
	Availability float64 `json:"availability"`
}

// ObjectUpdateResponse is returned to the browser after an insert or update (e.g. for concurrency control)
type ObjectUpdateResponse struct {
	LastUpdateUUID string `json:"lastUpdateUUID"`
}

// Settings holds stored configuration options
type Settings struct {
	ImproveURL string `datastore:"ImproveUrl"` // Field name overridden for backwards compatibility
}

// StorageService to represent the persistent store
type StorageService interface {
	GetAllTeams(ctx context.Context) ([]Team, error)
	GetTeam(ctx context.Context, teamID string) (Team, bool, error)
	CreateTeam(ctx context.Context, team Team) error
	UpdateTeam(ctx context.Context, team Team) error
	GetAllPeriods(ctx context.Context, teamID string) ([]Period, bool, error)
	GetPeriod(ctx context.Context, teamID, periodID string) (Period, bool, error)
	CreatePeriod(ctx context.Context, teamID string, period Period) error
	UpdatePeriod(ctx context.Context, teamID string, period Period) error
	GetSettings(ctx context.Context) (Settings, error)
	Close() error
}

// Server struct to handle incoming HTTP requests
type Server struct {
	store        StorageService
	storeTimeout time.Duration
}

func (s *Server) makeHandler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/team/", s.handleTeam)
	mux.HandleFunc("/api/period/", s.handlePeriod)
	mux.HandleFunc("/improve", s.handleImprove)
	return mux
}

func (s *Server) ensureTeamExistence(w http.ResponseWriter, r *http.Request, teamID string, expected bool) bool {
	ctx, cancel := context.WithTimeout(r.Context(), s.storeTimeout)
	defer cancel()
	_, exists, err := s.store.GetTeam(ctx, teamID)
	if err != nil {
		log.Printf("Could not validate existence of team '%s': error: %s", teamID, err)
		http.Error(w, fmt.Sprintf("Could not validate existence of team '%s' (see server log)", teamID), http.StatusInternalServerError)
		return false
	}
	if exists != expected {
		statusCode := http.StatusBadRequest
		if expected {
			statusCode = http.StatusNotFound
		}
		http.Error(w, fmt.Sprintf("Team with ID '%s' expected exists=%v, found %v", teamID, expected, exists), statusCode)
		return false
	}
	return true
}

func (s *Server) ensurePeriodExistence(w http.ResponseWriter, r *http.Request, teamID, periodID string, expected bool) (Period, bool) {
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

func (s *Server) ensureNoConcurrentMod(w http.ResponseWriter, r *http.Request, period, savedPeriod Period) bool {
	if savedPeriod.LastUpdateUUID != period.LastUpdateUUID {
		msg := fmt.Sprintf("Concurrent modification: last saved UUID=%s, your last loaded UUID=%s",
			savedPeriod.LastUpdateUUID, period.LastUpdateUUID)
		http.Error(w, msg, http.StatusConflict)
		return false
	}
	return true
}

func (s *Server) handleTeam(w http.ResponseWriter, r *http.Request) {
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 4 {
		http.NotFound(w, r)
		return
	}
	teamID := pathParts[3]
	if r.Method == http.MethodGet {
		s.handleGetTeam(w, r, teamID)
	} else if r.Method == http.MethodPost {
		s.handlePostTeam(w, r)
	} else if r.Method == http.MethodPut {
		s.handlePutTeam(w, r)
	} else {
		http.Error(w, fmt.Sprintf("Unsupported method '%s'", r.Method), http.StatusBadRequest)
	}
}

func (s *Server) handleGetTeam(w http.ResponseWriter, r *http.Request, teamID string) {
	ctx, cancel := context.WithTimeout(r.Context(), s.storeTimeout)
	defer cancel()
	if teamID == "" {
		teams, err := s.store.GetAllTeams(ctx)
		if err != nil {
			log.Printf("Could not retrieve teams: error: %s", err)
			http.Error(w, "Could not retrieve teams (see server log)", http.StatusInternalServerError)
			return
		}
		enc := json.NewEncoder(w)
		w.Header().Set("Content-Type", "application/json")
		enc.Encode(teams)
	} else {
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
		enc := json.NewEncoder(w)
		w.Header().Set("Content-Type", "application/json")
		enc.Encode(team)
	}
}

func (s *Server) handlePostTeam(w http.ResponseWriter, r *http.Request) {
	team, ok := readTeamFromBody(w, r)
	if !ok {
		return
	}
	if !s.ensureTeamExistence(w, r, team.ID, false) {
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), s.storeTimeout)
	defer cancel()
	err := s.store.CreateTeam(ctx, team)
	if err != nil {
		log.Printf("Could not create team: error: %s", err)
		http.Error(w, "Could not create team (see server log)", http.StatusInternalServerError)
		return
	}
}

func (s *Server) handlePutTeam(w http.ResponseWriter, r *http.Request) {
	team, ok := readTeamFromBody(w, r)
	if !ok {
		return
	}
	if !s.ensureTeamExistence(w, r, team.ID, true) {
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), s.storeTimeout)
	defer cancel()
	err := s.store.UpdateTeam(ctx, team)
	if err != nil {
		log.Printf("Could not update team: error: %s", err)
		http.Error(w, "Could not update team (see server log)", http.StatusInternalServerError)
		return
	}
}

func readTeamFromBody(w http.ResponseWriter, r *http.Request) (Team, bool) {
	dec := json.NewDecoder(r.Body)
	team := Team{}
	err := dec.Decode(&team)
	if err != nil {
		http.Error(w, fmt.Sprintf("Could not decode body: %v", err), http.StatusBadRequest)
		return team, false
	}
	return team, true
}

func (s *Server) handlePeriod(w http.ResponseWriter, r *http.Request) {
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 5 {
		http.NotFound(w, r)
		return
	}
	teamID := pathParts[3]
	periodID := pathParts[4]
	if r.Method == http.MethodGet {
		s.handleGetPeriod(w, r, teamID, periodID)
	} else if r.Method == http.MethodPost {
		s.handlePostPeriod(w, r, teamID)
	} else if r.Method == http.MethodPut {
		s.handlePutPeriod(w, r, teamID, periodID)
	} else {
		http.Error(w, fmt.Sprintf("Unsupported method '%s'", r.Method), http.StatusBadRequest)
	}
}

func (s *Server) handleGetPeriod(w http.ResponseWriter, r *http.Request, teamID, periodID string) {
	ctx, cancel := context.WithTimeout(r.Context(), s.storeTimeout)
	defer cancel()
	if periodID == "" {
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
	}
}

func (s *Server) writePeriodUpdateResponse(w http.ResponseWriter, r *http.Request, period Period) {
	response := ObjectUpdateResponse{LastUpdateUUID: period.LastUpdateUUID}
	enc := json.NewEncoder(w)
	w.Header().Set("Content-Type", "application/json")
	enc.Encode(response)
}

func (s *Server) handlePostPeriod(w http.ResponseWriter, r *http.Request, teamID string) {
	period, ok := readPeriodFromBody(w, r)
	if !ok {
		return
	}
	if !s.ensureTeamExistence(w, r, teamID, true) {
		return
	}
	if _, ok := s.ensurePeriodExistence(w, r, teamID, period.ID, false); !ok {
		return
	}
	period.LastUpdateUUID = uuid.New().String()
	ctx, cancel := context.WithTimeout(r.Context(), s.storeTimeout)
	defer cancel()
	err := s.store.CreatePeriod(ctx, teamID, period)
	if err != nil {
		log.Printf("Could not create period for team '%s': error: %s", teamID, err)
		http.Error(w, fmt.Sprintf("Could not create period for team '%s' (see server log)", teamID), http.StatusInternalServerError)
		return
	}
	s.writePeriodUpdateResponse(w, r, period)
}

func (s *Server) handlePutPeriod(w http.ResponseWriter, r *http.Request, teamID, periodID string) {
	period, ok := readPeriodFromBody(w, r)
	if !ok {
		return
	}
	if !s.ensureTeamExistence(w, r, teamID, true) {
		return
	}
	savedPeriod, ok := s.ensurePeriodExistence(w, r, teamID, periodID, true)
	if !ok || !s.ensureNoConcurrentMod(w, r, period, savedPeriod) {
		return
	}
	period.LastUpdateUUID = uuid.New().String()
	ctx, cancel := context.WithTimeout(r.Context(), s.storeTimeout)
	defer cancel()
	err := s.store.UpdatePeriod(ctx, teamID, period)
	if err != nil {
		log.Printf("Could not update period '%s' for team '%s': error: %s", periodID, teamID, err)
		http.Error(w, fmt.Sprintf("Could not update period '%s' for team '%s' (see server log)", periodID, teamID), http.StatusInternalServerError)
		return
	}
	s.writePeriodUpdateResponse(w, r, period)
}

func readPeriodFromBody(w http.ResponseWriter, r *http.Request) (Period, bool) {
	dec := json.NewDecoder(r.Body)
	period := Period{}
	err := dec.Decode(&period)
	if err != nil {
		http.Error(w, fmt.Sprintf("Could not decode body: %v", err), http.StatusBadRequest)
		return period, false
	}
	for _, bucket := range period.Buckets {
		for _, objective := range bucket.Objectives {
			if objective.CommitmentType != "" {
				if objective.CommitmentType != CommitmentTypeCommitted && objective.CommitmentType != CommitmentTypeAspirational {
					http.Error(w, fmt.Sprintf("Illegal commitment type '%s'", objective.CommitmentType), http.StatusBadRequest)
					return period, false
				}
			}
		}
	}
	return period, true
}

func (s *Server) handleImprove(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		ctx, cancel := context.WithTimeout(r.Context(), s.storeTimeout)
		defer cancel()
		settings, err := s.store.GetSettings(ctx)
		if err != nil {
			http.Error(w, fmt.Sprintf("Could not retrieve settings: %v", err), http.StatusInternalServerError)
			return
		}
		http.Redirect(w, r, settings.ImproveURL, http.StatusFound)
	} else {
		http.Error(w, fmt.Sprintf("Unsupported method '%s'", r.Method), http.StatusBadRequest)
	}
}

func main() {
	var useInMemStore bool
	flag.BoolVar(&useInMemStore, "inmemstore", false, "Use in-memory datastore")
	flag.Parse()

	var store StorageService
	if useInMemStore {
		log.Printf("Using in-memory store per command-line flag")
		store = makeInMemStore()
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
		store, err = makeGoogleCDSStore(ctx, gcloudProject)
		if err != nil {
			log.Fatalf("Could not instantiate datastore: %s", err)
			return
		}
	}
	server := Server{store: store, storeTimeout: defaultStoreTimeout}
	handler := server.makeHandler()
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
		log.Printf("Defaulting to port %s", port)
	}
	log.Printf("Listening on port %s", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), handler))
}
