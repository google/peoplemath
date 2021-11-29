// Copyright 2020-21 Google LLC
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

package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"peoplemath/auth"
	"peoplemath/models"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

func (s *Server) ensurePeriodExistence(w http.ResponseWriter, r *http.Request, teamID, periodID string, expected bool) (*models.Period, bool) {
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

func (s *Server) ensureNoConcurrentMod(w http.ResponseWriter, r *http.Request, period, savedPeriod *models.Period) bool {
	if savedPeriod.LastUpdateUUID != period.LastUpdateUUID {
		msg := fmt.Sprintf("Concurrent modification: last saved UUID=%s, your last loaded UUID=%s",
			savedPeriod.LastUpdateUUID, period.LastUpdateUUID)
		http.Error(w, msg, http.StatusConflict)

		return false
	}
	return true
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

func (s *Server) writePeriodUpdateResponse(w http.ResponseWriter, r *http.Request, period *models.Period) {
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
		err = s.backupPeriod(ctx, teamID, periodID, savedPeriod)
		if err != nil {
			log.Printf("WARNING: Could not back up period '%s' for team '%s': %s", periodID, teamID, err)
		}
		s.writePeriodUpdateResponse(w, r, period)
	} else {
		http.Error(w, "You are not authorized to edit this team's periods.", http.StatusForbidden)
	}
}

func (s *Server) backupPeriod(ctx context.Context, teamID, periodID string, period *models.Period) error {
	backups, ok, err := s.store.GetPeriodBackups(ctx, teamID, periodID)
	if err != nil {
		return err
	}
	if !ok {
		backups = models.PeriodBackups{}
	}
	backup := models.PeriodBackup{
		Timestamp: time.Now(),
		Period:    *period,
	}
	backups.Backups = append(backups.Backups, backup)
	purgeOldBackups(&backups)
	log.Printf("Backup %s %s: %d backups, oldest %s, newest %s", teamID, periodID, len(backups.Backups), backups.Backups[0].Timestamp.Format(time.RFC3339), backups.Backups[len(backups.Backups)-1].Timestamp.Format(time.RFC3339))
	return s.store.UpsertPeriodBackups(ctx, teamID, periodID, backups)
}

const backupsToKeep = 10

func purgeOldBackups(backups *models.PeriodBackups) {
	// Just keep the last N
	if len(backups.Backups) > backupsToKeep {
		toRemove := len(backups.Backups) - backupsToKeep
		backups.Backups = backups.Backups[toRemove:]
	}
}

func readPeriodFromBody(w http.ResponseWriter, r *http.Request) (*models.Period, bool) {
	dec := json.NewDecoder(r.Body)
	period := models.Period{}
	err := dec.Decode(&period)
	if err != nil {
		http.Error(w, fmt.Sprintf("Could not decode body: %v", err), http.StatusBadRequest)
		return &period, false
	}
	for _, bucket := range period.Buckets {
		for _, objective := range bucket.Objectives {
			if objective.CommitmentType != "" {
				if objective.CommitmentType != models.CommitmentTypeCommitted && objective.CommitmentType != models.CommitmentTypeAspirational {
					http.Error(w, fmt.Sprintf("Illegal commitment type '%s'", objective.CommitmentType), http.StatusBadRequest)
					return &period, false
				}
			}
		}
	}
	return &period, true
}
