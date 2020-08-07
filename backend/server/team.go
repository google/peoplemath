package server

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"log"
	"net/http"
	"peoplemath/models"
)

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

func (s *Server) handleGetAllTeams(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), s.storeTimeout)
	defer cancel()
	teams, err := s.store.GetAllTeams(ctx)
	if err != nil {
		log.Printf("Could not retrieve teams: error: %s", err)
		http.Error(w, "Could not retrieve teams (see server log)", http.StatusInternalServerError)
		return
	}
	enc := json.NewEncoder(w)
	w.Header().Set("Content-Type", "application/json")
	enc.Encode(teams)
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
	enc := json.NewEncoder(w)
	w.Header().Set("Content-Type", "application/json")
	enc.Encode(team)
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
