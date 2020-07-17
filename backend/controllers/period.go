package controllers

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"log"
	"net/http"
	"peoplemath/models"
	"peoplemath/storage"
	"strings"
)

// TODO should we use query params (like: ?param=value) to get values in more comfortable way via https://golang.org/pkg/net/url/#URL.Query ?
func (c *PeriodController) getParams(w http.ResponseWriter, r *http.Request) (teamID string, periodID string) {
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 5 {
		http.NotFound(w, r)
		return
	}
	teamID = pathParts[3]
	periodID = pathParts[4]
	return
}

func (c *PeriodController) ensurePeriodExistence(ctx context.Context, teamID, periodID string, expected bool, s storage.StorageService) (models.Period, bool, error, int) {
	period, exists, err := s.GetPeriod(ctx, teamID, periodID)
	if err != nil {
		log.Printf("Could not validate existence of period '%s' for team '%s': error: %s", periodID, teamID, err)
		err = errors.New(fmt.Sprintf("Could not validate existence of period '%s' for team '%s' (see server log)", periodID, teamID))
		return period, false, err, http.StatusInternalServerError
	}
	if exists != expected {
		statusCode := http.StatusBadRequest
		if expected {
			statusCode = http.StatusNotFound
		}
		err = errors.New(fmt.Sprintf("Period '%s' for team '%s' expected exists=%v, found %v", periodID, teamID, expected, exists))
		return period, false, err, statusCode
	}
	return period, true, nil, http.StatusOK
}

func (c *PeriodController) ensureNoConcurrentMod(period, savedPeriod models.Period) (bool, error, int) {
	if savedPeriod.LastUpdateUUID != period.LastUpdateUUID {
		err := errors.New(fmt.Sprintf("Concurrent modification: last saved UUID=%s, your last loaded UUID=%s",
			savedPeriod.LastUpdateUUID, period.LastUpdateUUID))
		return false, err, http.StatusConflict
	}
	return true, nil, http.StatusOK
}

func (c *PeriodController) readPeriodFromBody(w http.ResponseWriter, r *http.Request) (models.Period, bool) {
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

func (c *PeriodController) Get(w http.ResponseWriter, r *http.Request) {
	ctx := context.TODO()
	teamID, periodID := c.getParams(w, r)
	period, found, err := c.Store.GetPeriod(ctx, teamID, periodID)
	if err != nil {
		log.Printf("Could not retrieve period '%s' for team '%s': error: %s", periodID, teamID, err)
		http.Error(w, fmt.Sprintf("Could not retrieve period '%s' for team '%s' (see server log)", periodID, teamID), http.StatusInternalServerError)
		return
	}
	if !found {
		http.NotFound(w, r)
		return
	}
	jsonEncode(w, period)
}

func (c *PeriodController) GetList(w http.ResponseWriter, r *http.Request) {
	ctx := context.TODO()
	teamID, _ := c.getParams(w, r)
	ok, err, code := c.ensureTeamExistence(ctx, teamID, false, c.Store)
	if !ok {
		if err != nil {
			http.Error(w, err.Error(), code)
		}
		return
	}
	periods, found, err := c.Store.GetAllPeriods(ctx, teamID)
	if err != nil {
		log.Printf("Could not retrieve periods for team '%s': error: %s", teamID, err)
		http.Error(w, fmt.Sprintf("Could not retrieve periods for team '%s' (see server log)", teamID), http.StatusInternalServerError)
		return
	}
	if !found {
		http.NotFound(w, r)
		return
	}
	jsonEncode(w, periods)
}

func (c *PeriodController) Post(w http.ResponseWriter, r *http.Request) {
	period, ok := c.readPeriodFromBody(w, r)
	if !ok {
		return
	}
	ctx := context.TODO()
	teamID, _ := c.getParams(w, r)
	ok, err, code := c.ensureTeamExistence(ctx, teamID, true, c.Store)
	if !ok {
		if err != nil {
			http.Error(w, err.Error(), code)
		}
		return
	}
	if _, ok, err, code := c.ensurePeriodExistence(ctx, teamID, period.ID, false, c.Store); !ok {
		if err != nil {
			http.Error(w, err.Error(), code)
		}
		return
	}
	period.LastUpdateUUID = uuid.New().String()
	err = c.Store.CreatePeriod(ctx, teamID, period)
	if err != nil {
		log.Printf("Could not create period for team '%s': error: %s", teamID, err)
		http.Error(w, fmt.Sprintf("Could not create period for team '%s' (see server log)", teamID), http.StatusInternalServerError)
		return
	}
	response := ObjectUpdateResponse{LastUpdateUUID: period.LastUpdateUUID}
	jsonEncode(w, response)
}

func (c *PeriodController) Put(w http.ResponseWriter, r *http.Request) {
	period, ok := c.readPeriodFromBody(w, r)
	if !ok {
		return
	}
	ctx := context.TODO()
	teamID, periodID := c.getParams(w, r)
	teamExists, err, code := c.ensureTeamExistence(ctx, teamID, true, c.Store)
	if !ok {
		if err != nil {
			http.Error(w, err.Error(), code)
		}
		return
	}
	savedPeriod, ok, err, code := c.ensurePeriodExistence(ctx, teamID, periodID, true, c.Store)
	if err != nil {
		http.Error(w, err.Error(), code)
	}
	noConcurencyMod, err, code := c.ensureNoConcurrentMod(period, savedPeriod)
	if err != nil {
		http.Error(w, err.Error(), code)
	}
	if !teamExists || !noConcurencyMod {
		return
	}
	period.LastUpdateUUID = uuid.New().String()
	err = c.Store.UpdatePeriod(ctx, teamID, period)
	if err != nil {
		log.Printf("Could not update period '%s' for team '%s': error: %s", periodID, teamID, err)
		http.Error(w, fmt.Sprintf("Could not update period '%s' for team '%s' (see server log)", periodID, teamID), http.StatusInternalServerError)
		return
	}
	response := ObjectUpdateResponse{LastUpdateUUID: period.LastUpdateUUID}
	jsonEncode(w, response)
}
