// Copyright 2019 Google LLC
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
	"log"
	"strings"
)

// In-memory implementation of StorageService, for local testing
type inMemStore struct {
	teams    map[string]Team
	periods  map[string]map[string]Period
	settings Settings
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
	settings := Settings{
		ImproveUrl: "https://github.com/google/peoplemath",
	}
	return &inMemStore{teams: teams, periods: periods, settings: settings}
}

func (s *inMemStore) GetAllTeams(ctx context.Context) ([]Team, error) {
	teamsSlice := make([]Team, 0, len(s.teams))
	for _, t := range s.teams {
		teamsSlice = append(teamsSlice, t)
	}
	return teamsSlice, nil
}

func (s *inMemStore) GetTeam(ctx context.Context, teamID string) (Team, bool, error) {
	team, ok := s.teams[teamID]
	return team, ok, nil
}

func (s *inMemStore) CreateTeam(ctx context.Context, team Team) error {
	s.teams[team.ID] = team
	s.periods[team.ID] = map[string]Period{}
	log.Printf("Added new team %s", team.ID)
	return nil
}

func (s *inMemStore) UpdateTeam(ctx context.Context, team Team) error {
	s.teams[team.ID] = team
	log.Printf("Updated team %s", team.ID)
	return nil
}

func (s *inMemStore) GetAllPeriods(ctx context.Context, teamID string) ([]Period, bool, error) {
	if periodsByName, ok := s.periods[teamID]; ok {
		periodSlice := make([]Period, 0, len(periodsByName))
		for _, p := range periodsByName {
			periodSlice = append(periodSlice, p)
		}
		return periodSlice, true, nil
	}
	return []Period{}, false, nil
}

func (s *inMemStore) GetPeriod(ctx context.Context, teamID, periodID string) (Period, bool, error) {
	if periodsByName, ok := s.periods[teamID]; ok {
		if period, ok := periodsByName[periodID]; ok {
			return period, true, nil
		}
	}
	return Period{}, false, nil
}

func (s *inMemStore) CreatePeriod(ctx context.Context, teamID string, period Period) error {
	if periodsByName, ok := s.periods[teamID]; ok {
		periodsByName[period.ID] = period
		log.Printf("Added period '%s' for team '%s': %v", period.ID, teamID, period)
	}
	return nil
}

func (s *inMemStore) UpdatePeriod(ctx context.Context, teamID string, period Period) error {
	if periodsByName, ok := s.periods[teamID]; ok {
		periodsByName[period.ID] = period
		log.Printf("Updated period '%s' for team '%s': %v", period.ID, teamID, period)
	}
	return nil
}

func (s *inMemStore) GetSettings(ctx context.Context) (Settings, error) {
	return s.settings, nil
}

func (s *inMemStore) Close() error {
	return nil
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
					CommitmentType:   "Committed",
					Assignments: []Assignment{
						Assignment{
							PersonID:   "alice",
							Commitment: 5,
						},
						Assignment{
							PersonID:   "bob",
							Commitment: 5,
						},
					},
				},
				Objective{
					Name:             "Second objective",
					ResourceEstimate: 15,
					CommitmentType:   "Aspirational",
					Assignments: []Assignment{
						Assignment{
							PersonID:   "bob",
							Commitment: 2,
						},
					},
				},
			},
		},
		Bucket{
			DisplayName:          "Second bucket",
			AllocationPercentage: 40,
			Objectives: []Objective{
				Objective{
					Name:             "Third objective",
					ResourceEstimate: 2,
					CommitmentType:   "Aspirational",
					Assignments:      []Assignment{},
				},
				Objective{
					Name:             "Fourth objective",
					ResourceEstimate: 8,
					CommitmentType:   "Aspirational",
					Assignments: []Assignment{
						Assignment{
							PersonID:   "charlie",
							Commitment: 8,
						},
					},
				},
			},
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
		ID:                     id,
		DisplayName:            strings.ToUpper(id),
		Unit:                   "person weeks",
		NotesURL:               "https://github.com/google/peoplemath",
		MaxCommittedPercentage: 50,
		Buckets:                buckets,
		People:                 people,
	}
}
