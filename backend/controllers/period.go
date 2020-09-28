package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"peoplemath/auth"
	"peoplemath/models"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

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
