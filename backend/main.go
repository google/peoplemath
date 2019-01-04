package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
)

// Team model struct
type Team struct {
	ID          string `json:"id"`
	DisplayName string `json:"displayName"`
}

// Period model struct
type Period struct {
	ID          string   `json:"id"`
	DisplayName string   `json:"displayName"`
	Unit        string   `json:"unit"`
	Buckets     []Bucket `json:"buckets"`
	People      []Person `json:"people"`
}

// Bucket model struct
type Bucket struct {
	DisplayName          string      `json:"displayName"`
	AllocationPercentage float64     `json:"allocationPercentage"`
	Objectives           []Objective `json:"objectives"`
}

// Objective model struct
type Objective struct {
	Name             string       `json:"name"`
	ResourceEstimate float64      `json:"resourceEstimate"`
	Assignments      []Assignment `json:"assignments"`
}

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

// StorageService to represent the persistent store
type StorageService interface {
	GetAllTeams() []Team
	GetTeam(teamID string) (Team, bool)
	CreateTeam(team Team)
	UpdateTeam(team Team)
	GetAllPeriods(teamID string) ([]Period, bool)
	GetPeriod(teamID, periodID string) (Period, bool)
	CreatePeriod(teamID string, period Period)
	UpdatePeriod(teamID string, period Period)
}

func makeHandler(store StorageService) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/team/", func(w http.ResponseWriter, r *http.Request) { handleTeam(w, r, store) })
	mux.HandleFunc("/api/period/", func(w http.ResponseWriter, r *http.Request) { handlePeriod(w, r, store) })
	return mux
}

func main() {
	// TODO Replace with real persistent store
	store := makeInMemStore()
	handler := makeHandler(store)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
		log.Printf("Defaulting to port %s", port)
	}
	log.Printf("Listening on port %s", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), handler))
}

func handleTeam(w http.ResponseWriter, r *http.Request, store StorageService) {
	pathParts := strings.Split(r.URL.Path, "/")
	log.Printf("Team path: %q", pathParts)
	if len(pathParts) != 4 {
		http.NotFound(w, r)
		return
	}
	teamID := pathParts[3]
	if r.Method == http.MethodGet {
		if teamID == "" {
			teams := store.GetAllTeams()
			enc := json.NewEncoder(w)
			w.Header().Set("Content-Type", "application/json")
			enc.Encode(teams)
		} else if team, ok := store.GetTeam(teamID); ok {
			enc := json.NewEncoder(w)
			w.Header().Set("Content-Type", "application/json")
			enc.Encode(team)
		} else {
			http.NotFound(w, r)
		}
	} else if r.Method == http.MethodPost {
		dec := json.NewDecoder(r.Body)
		team := Team{}
		err := dec.Decode(&team)
		if err != nil {
			http.Error(w, fmt.Sprintf("Could not decode body: %v", err), http.StatusBadRequest)
			return
		}
		if _, exists := store.GetTeam(team.ID); exists {
			http.Error(w, fmt.Sprintf("Team with ID '%s' already exists", team.ID), http.StatusBadRequest)
			return
		}
		store.CreateTeam(team)
	} else if r.Method == http.MethodPut {
		dec := json.NewDecoder(r.Body)
		team := Team{}
		err := dec.Decode(&team)
		if err != nil {
			http.Error(w, fmt.Sprintf("Could not decode body: %v", err), http.StatusBadRequest)
			return
		}
		if _, exists := store.GetTeam(teamID); !exists {
			http.Error(w, fmt.Sprintf("No team with ID '%s'", team.ID), http.StatusNotFound)
			return
		}
		store.UpdateTeam(team)
	} else {
		http.Error(w, fmt.Sprintf("Unsupported method '%s'", r.Method), http.StatusBadRequest)
		return
	}
}

func handlePeriod(w http.ResponseWriter, r *http.Request, store StorageService) {
	pathParts := strings.Split(r.URL.Path, "/")
	log.Printf("Period path: %q", pathParts)
	if len(pathParts) != 5 {
		http.NotFound(w, r)
		return
	}
	teamID := pathParts[3]
	periodID := pathParts[4]
	if r.Method == http.MethodGet {
		if periodID == "" {
			if periods, ok := store.GetAllPeriods(teamID); ok {
				enc := json.NewEncoder(w)
				w.Header().Set("Content-Type", "application/json")
				enc.Encode(periods)
			} else {
				http.NotFound(w, r)
			}
		} else if period, ok := store.GetPeriod(teamID, periodID); ok {
			enc := json.NewEncoder(w)
			w.Header().Set("Content-Type", "application/json")
			enc.Encode(period)
		} else {
			http.NotFound(w, r)
		}
	} else if r.Method == http.MethodPost {
		dec := json.NewDecoder(r.Body)
		period := Period{}
		err := dec.Decode(&period)
		if err != nil {
			http.Error(w, fmt.Sprintf("Could not decode body: %v", err), http.StatusBadRequest)
			return
		}
		if _, teamExists := store.GetTeam(teamID); !teamExists {
			http.Error(w, fmt.Sprintf("Team '%s' not found", teamID), http.StatusNotFound)
			return
		}
		if _, periodExists := store.GetPeriod(teamID, period.ID); periodExists {
			http.Error(w, fmt.Sprintf("Period with ID '%s' already exists for team '%s'", period.ID, teamID), http.StatusBadRequest)
			return
		}
		store.CreatePeriod(teamID, period)
	} else if r.Method == http.MethodPut {
		dec := json.NewDecoder(r.Body)
		period := Period{}
		err := dec.Decode(&period)
		if err != nil {
			http.Error(w, fmt.Sprintf("Could not decode body: %v", err), http.StatusBadRequest)
			return
		}
		if _, teamExists := store.GetTeam(teamID); !teamExists {
			http.Error(w, fmt.Sprintf("Team '%s' not found", teamID), http.StatusNotFound)
			return
		}
		if _, periodExists := store.GetPeriod(teamID, periodID); !periodExists {
			http.Error(w, fmt.Sprintf("Period ID '%s' not found for team '%s'", period.ID, teamID), http.StatusNotFound)
			return
		}
		store.UpdatePeriod(teamID, period)
	} else {
		http.Error(w, fmt.Sprintf("Unsupported method '%s'", r.Method), http.StatusBadRequest)
		return
	}
}
