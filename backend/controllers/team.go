package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"peoplemath/models"
	"strings"
)

// TODO should we use query params (like: ?param=value) to get values in more comfortable way via https://golang.org/pkg/net/url/#URL.Query ?
func (c *TeamController) getTeamId(w http.ResponseWriter, r *http.Request) string {
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 4 {
		http.NotFound(w, r)
		return ""
	}
	teamID := pathParts[3]
	return teamID
}

func (c *TeamController) readTeamFromBody(w http.ResponseWriter, r *http.Request) (models.Team, bool) {
	dec := json.NewDecoder(r.Body)
	team := models.Team{}
	err := dec.Decode(&team)
	if err != nil {
		http.Error(w, fmt.Sprintf("Could not decode body: %v", err), http.StatusBadRequest)
		return team, false
	}
	return team, true
}

func (c *TeamController) Get(w http.ResponseWriter, r *http.Request) {
	ctx := context.TODO()
	teamID := c.getTeamId(w, r)
	team, found, err := c.Store.GetTeam(ctx, teamID)
	if err != nil {
		log.Printf("Could not retrieve team '%s': error: %s", teamID, err)
		http.Error(w, fmt.Sprintf("Could not retrieve team '%s' (see server log)", teamID), http.StatusInternalServerError)
		return
	}
	if !found {
		http.NotFound(w, r)
		return
	}
	jsonEncode(w, team)
}

func (c *TeamController) GetList(w http.ResponseWriter, r *http.Request) {
	ctx := context.TODO()
	teams, err := c.Store.GetAllTeams(ctx)
	if err != nil {
		log.Printf("Could not retrieve teams: error: %s", err)
		http.Error(w, "Could not retrieve teams (see server log)", http.StatusInternalServerError)
		return
	}
	jsonEncode(w, teams)
}

func (c *TeamController) Post(w http.ResponseWriter, r *http.Request) {
	team, ok := c.readTeamFromBody(w, r)
	if !ok {
		return
	}
	ctx := context.TODO()
	ok, err, code := c.ensureTeamExistence(ctx, team.ID, false, c.Store)
	if !ok {
		if err != nil {
			http.Error(w, err.Error(), code)
		}
		return
	}
	err = c.Store.CreateTeam(ctx, team)
	if err != nil {
		log.Printf("Could not create team: error: %s", err)
		http.Error(w, "Could not create team (see server log)", http.StatusInternalServerError)
		return
	}
}

func (c *TeamController) Put(w http.ResponseWriter, r *http.Request) {
	team, ok := c.readTeamFromBody(w, r)
	if !ok {
		return
	}
	ctx := context.TODO()
	ok, err, code := c.ensureTeamExistence(ctx, team.ID, false, c.Store)
	if !ok {
		if err != nil {
			http.Error(w, err.Error(), code)
		}
		return
	}
	err = c.Store.UpdateTeam(ctx, team)
	if err != nil {
		log.Printf("Could not update team: error: %s", err)
		http.Error(w, "Could not update team (see server log)", http.StatusInternalServerError)
		return
	}
}
