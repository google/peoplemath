package main

import (
	"log"
	"strings"
)

// In-memory implementation of StorageService, for local testing
type inMemStore struct {
	teams   map[string]Team
	periods map[string]map[string]Period
}

func makeInMemStore() StorageService {
	teams := map[string]Team{
		"team1": {ID: "team1", DisplayName: "Team team1"},
		"team2": {ID: "team2", DisplayName: "Team team2"},
	}
	periods := map[string]map[string]Period{
		"team1": {
			"2018q4": makeFakePeriod("2018q4"),
			"2019q1": makeFakePeriod("2019q1"),
		},
		"team2": {
			"2018q4": makeFakePeriod("2018q4"),
		},
	}
	return &inMemStore{teams: teams, periods: periods}
}

func (s *inMemStore) GetAllTeams() []Team {
	teamsSlice := make([]Team, 0, len(s.teams))
	for _, t := range s.teams {
		teamsSlice = append(teamsSlice, t)
	}
	return teamsSlice
}

func (s *inMemStore) GetTeam(teamID string) (Team, bool) {
	team, ok := s.teams[teamID]
	return team, ok
}

func (s *inMemStore) CreateTeam(team Team) {
	s.teams[team.ID] = team
	s.periods[team.ID] = map[string]Period{}
	log.Printf("Added new team %s", team.ID)
}

func (s *inMemStore) UpdateTeam(team Team) {
	s.teams[team.ID] = team
	log.Printf("Updated team %s", team.ID)
}

func (s *inMemStore) GetAllPeriods(teamID string) ([]Period, bool) {
	if periodsByName, ok := s.periods[teamID]; ok {
		periodSlice := make([]Period, 0, len(periodsByName))
		for _, p := range periodsByName {
			periodSlice = append(periodSlice, p)
		}
		return periodSlice, true
	}
	return []Period{}, false
}

func (s *inMemStore) GetPeriod(teamID, periodID string) (Period, bool) {
	if periodsByName, ok := s.periods[teamID]; ok {
		if period, ok := periodsByName[periodID]; ok {
			return period, true
		}
	}
	return Period{}, false
}

func (s *inMemStore) CreatePeriod(teamID string, period Period) {
	if periodsByName, ok := s.periods[teamID]; ok {
		periodsByName[period.ID] = period
		log.Printf("Added period '%s' for team '%s': %v", period.ID, teamID, period)
	}
}

func (s *inMemStore) UpdatePeriod(teamID string, period Period) {
	if periodsByName, ok := s.periods[teamID]; ok {
		periodsByName[period.ID] = period
		log.Printf("Updated period '%s' for team '%s': %v", period.ID, teamID, period)
	}
}

func makeFakePeriod(id string) Period {
	buckets := []Bucket{
		Bucket{
			DisplayName:          "First bucket",
			AllocationPercentage: 40,
			Objectives: []Objective{
				Objective{
					Name:             "First objective",
					ResourceEstimate: 10,
					Assignments:      []Assignment{},
				},
				Objective{
					Name:             "Second objective",
					ResourceEstimate: 15,
					Assignments:      []Assignment{},
				},
			},
		},
		Bucket{
			DisplayName:          "Second bucket",
			AllocationPercentage: 40,
			Objectives:           []Objective{},
		},
		Bucket{
			DisplayName:          "Third bucket",
			AllocationPercentage: 20,
			Objectives:           []Objective{},
		},
	}
	people := []Person{
		Person{
			ID:           "alice",
			DisplayName:  "Alice Atkins",
			Availability: 5,
		},
		Person{
			ID:           "bob",
			DisplayName:  "Bob Brewster",
			Availability: 7,
		},
		Person{
			ID:           "charlie",
			DisplayName:  "Charlie Case",
			Availability: 8,
		},
	}
	return Period{
		ID:          id,
		DisplayName: strings.ToUpper(id),
		Unit:        "person weeks",
		Buckets:     buckets,
		People:      people,
	}
}
