// Copyright 2020 Google LLC
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
	"reflect"

	"github.com/gorilla/mux"
)

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
