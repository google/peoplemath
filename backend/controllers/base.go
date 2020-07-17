package controllers

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"peoplemath/storage"
)

// ObjectUpdateResponse is returned to the browser after an insert or update (e.g. for concurrency control)
type ObjectUpdateResponse struct {
	LastUpdateUUID string `json:"lastUpdateUUID"`
}

type BaseController struct {
	Store storage.StorageService
}

type TeamController struct {
	*BaseController
}

type PeriodController struct {
	*BaseController
}

type ImproveController struct {
	*BaseController
}

var (
	improveController *ImproveController
	teamController    *TeamController
	periodController  *PeriodController
	baseController    *BaseController
)

func InitControllers() {
	baseController = new(BaseController)
	baseController.Store = storage.GetStorage()

	teamController = new(TeamController)
	teamController.BaseController = baseController

	periodController = new(PeriodController)
	periodController.BaseController = baseController

	improveController = new(ImproveController)
	improveController.BaseController = baseController
}

func GetTeamController() *TeamController {
	return teamController
}

func GetPeriodController() *PeriodController {
	return periodController
}

func GetImproveController() *ImproveController {
	return improveController
}

func jsonEncode(w http.ResponseWriter, i interface{}) {
	enc := json.NewEncoder(w)
	w.Header().Set("Content-Type", "application/json")
	err := enc.Encode(i)
	if err != nil {
		fmt.Println(err)
	}
}

func (c *BaseController) ensureTeamExistence(ctx context.Context, teamID string, expected bool, s storage.StorageService) (bool, error, int) {
	_, exists, err := s.GetTeam(ctx, teamID)
	if err != nil {
		log.Printf("Could not validate existence of team '%s': error: %s", teamID, err)
		err = errors.New(fmt.Sprintf("Could not validate existence of team '%s' (see server log)", teamID))
		return false, err, http.StatusInternalServerError
	}
	if exists != expected {
		statusCode := http.StatusBadRequest
		if expected {
			statusCode = http.StatusNotFound
		}
		err = errors.New(fmt.Sprintf("Team with ID '%s' expected exists=%v, found %v", teamID, expected, exists))
		return false, err, statusCode
	}
	return true, nil, http.StatusOK
}
