// Copyright 2019-2020 Google LLC
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

package in_memory_storage

import (
	"context"
	"log"
	"peoplemath/models"
	"peoplemath/storage"
	"strings"
)

// In-memory implementation of StorageService, for local testing
type inMemStore struct {
	teams    map[string]models.Team
	periods  map[string]map[string]models.Period
	settings models.Settings
}

func MakeInMemStore() storage.StorageService {
	teams := map[string]models.Team{
		"team1": {ID: "team1", DisplayName: "Team team1"},
		"team2": {ID: "team2", DisplayName: "Team team2"},
	}
	periods := map[string]map[string]models.Period{
		"team1": {
			"2018q4": makeFakePeriod("2018q4"),
			"2019q1": makeFakePeriod("2019q1"),
		},
		"team2": {
			"2018q4": makeFakePeriod("2018q4"),
		},
	}
	settings := models.Settings{
		ImproveURL: "https://github.com/google/peoplemath",
	}
	return &inMemStore{teams: teams, periods: periods, settings: settings}
}

func (s *inMemStore) GetAllTeams(ctx context.Context) ([]models.Team, error) {
	teamsSlice := make([]models.Team, 0, len(s.teams))
	for _, t := range s.teams {
		teamsSlice = append(teamsSlice, t)
	}
	return teamsSlice, nil
}

func (s *inMemStore) GetTeam(ctx context.Context, teamID string) (models.Team, bool, error) {
	team, ok := s.teams[teamID]
	return team, ok, nil
}

func (s *inMemStore) CreateTeam(ctx context.Context, team models.Team) error {
	s.teams[team.ID] = team
	s.periods[team.ID] = map[string]models.Period{}
	log.Printf("Added new team %s", team.ID)
	return nil
}

func (s *inMemStore) UpdateTeam(ctx context.Context, team models.Team) error {
	s.teams[team.ID] = team
	log.Printf("Updated team %s", team.ID)
	return nil
}

func (s *inMemStore) GetAllPeriods(ctx context.Context, teamID string) ([]models.Period, bool, error) {
	if periodsByName, ok := s.periods[teamID]; ok {
		periodSlice := make([]models.Period, 0, len(periodsByName))
		for _, p := range periodsByName {
			periodSlice = append(periodSlice, p)
		}
		return periodSlice, true, nil
	}
	return []models.Period{}, false, nil
}

func (s *inMemStore) GetPeriod(ctx context.Context, teamID, periodID string) (models.Period, bool, error) {
	if periodsByName, ok := s.periods[teamID]; ok {
		if period, ok := periodsByName[periodID]; ok {
			return period, true, nil
		}
	}
	return models.Period{}, false, nil
}

func (s *inMemStore) CreatePeriod(ctx context.Context, teamID string, period models.Period) error {
	if periodsByName, ok := s.periods[teamID]; ok {
		periodsByName[period.ID] = period
		log.Printf("Added period '%s' for team '%s': %v", period.ID, teamID, period)
	}
	return nil
}

func (s *inMemStore) UpdatePeriod(ctx context.Context, teamID string, period models.Period) error {
	if periodsByName, ok := s.periods[teamID]; ok {
		periodsByName[period.ID] = period
		log.Printf("Updated period '%s' for team '%s': %v", period.ID, teamID, period)
	}
	return nil
}

func (s *inMemStore) GetSettings(ctx context.Context) (models.Settings, error) {
	return s.settings, nil
}

func (s *inMemStore) Close() error {
	return nil
}

func makeFakePeriod(id string) models.Period {
	buckets := []models.Bucket{
		models.Bucket{
			DisplayName:          "First bucket",
			AllocationPercentage: 40,
			Objectives: []models.Objective{
				models.Objective{
					Name:             "First objective",
					ResourceEstimate: 10,
					CommitmentType:   "Committed",
					Assignments: []models.Assignment{
						models.Assignment{
							PersonID:   "alice",
							Commitment: 5,
						},
						models.Assignment{
							PersonID:   "bob",
							Commitment: 5,
						},
					},
					Groups: []models.ObjectiveGroup{
						models.ObjectiveGroup{
							GroupType: "Project",
							GroupName: "Project 1",
						},
					},
					Tags: []models.ObjectiveTag{},
				},
				models.Objective{
					Name:             "Second objective",
					ResourceEstimate: 15,
					CommitmentType:   "Aspirational",
					Notes:            "Some notes",
					Assignments: []models.Assignment{
						models.Assignment{
							PersonID:   "bob",
							Commitment: 2,
						},
					},
					Groups: []models.ObjectiveGroup{
						models.ObjectiveGroup{
							GroupType: "Project",
							GroupName: "Project 2",
						},
					},
					Tags: []models.ObjectiveTag{
						models.ObjectiveTag{
							Name: "tag1",
						},
						models.ObjectiveTag{
							Name: "tag2",
						},
					},
				},
			},
		},
		models.Bucket{
			DisplayName:          "Second bucket",
			AllocationPercentage: 40,
			Objectives: []models.Objective{
				models.Objective{
					Name:             "Third objective",
					ResourceEstimate: 2,
					CommitmentType:   "Aspirational",
					Assignments:      []models.Assignment{},
					Groups: []models.ObjectiveGroup{
						models.ObjectiveGroup{
							GroupType: "Project",
							GroupName: "Project 1",
						},
					},
					Tags: []models.ObjectiveTag{},
				},
				models.Objective{
					Name:             "Fourth objective",
					ResourceEstimate: 8,
					CommitmentType:   "Aspirational",
					Assignments: []models.Assignment{
						models.Assignment{
							PersonID:   "charlie",
							Commitment: 8,
						},
					},
					Groups: []models.ObjectiveGroup{
						models.ObjectiveGroup{
							GroupType: "Project",
							GroupName: "Project 1",
						},
					},
					Tags: []models.ObjectiveTag{
						models.ObjectiveTag{
							Name: "tag2",
						},
					},
				},
			},
		},
		models.Bucket{
			DisplayName:          "Third bucket",
			AllocationPercentage: 20,
			Objectives:           []models.Objective{},
		},
	}
	people := []models.Person{
		models.Person{
			ID:           "alice",
			DisplayName:  "Alice Atkins",
			Location:     "LON",
			Availability: 5,
		},
		models.Person{
			ID:           "bob",
			DisplayName:  "Bob Brewster",
			Location:     "LON",
			Availability: 7,
		},
		models.Person{
			ID:           "charlie",
			DisplayName:  "Charlie Case",
			Location:     "SVL",
			Availability: 8,
		},
	}
	return models.Period{
		ID:          id,
		DisplayName: strings.ToUpper(id),
		Unit:        "person weeks",
		SecondaryUnits: []models.SecondaryUnit{
			models.SecondaryUnit{
				Name:             "person years",
				ConversionFactor: 7.0 / 365.0,
			},
		},
		NotesURL:               "https://github.com/google/peoplemath",
		MaxCommittedPercentage: 50,
		Buckets:                buckets,
		People:                 people,
	}
}
