// Copyright 2024 Google LLC
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

package storage

import (
	"context"
	"peoplemath/models"
	"testing"
)

type testStore struct {
	teams   map[string]models.Team
	periods map[string]models.Period
}

func (s *testStore) GetAllTeams(ctx context.Context) ([]models.Team, error) {
	var result []models.Team
	for _, t := range s.teams {
		result = append(result, t)
	}
	return result, nil
}

func (s *testStore) GetTeam(ctx context.Context, teamID string) (models.Team, bool, error) {
	team, ok := s.teams[teamID]
	return team, ok, nil
}

func (s *testStore) GetAllPeriods(ctx context.Context, teamID string) ([]models.Period, bool, error) {
	var result []models.Period
	for _, p := range s.periods {
		result = append(result, p)
	}
	return result, true, nil
}

func (s *testStore) GetPeriod(ctx context.Context, teamID string, periodID string) (*models.Period, bool, error) {
	p, ok := s.periods[periodID]
	return &p, ok, nil
}

func (s *testStore) CreateTeam(ctx context.Context, team models.Team) error {
	panic("not implemented")
}

func (s *testStore) UpdateTeam(ctx context.Context, team models.Team) error {
	panic("not implemented")
}

func (s *testStore) CreatePeriod(ctx context.Context, teamID string, period *models.Period) error {
	panic("not implemented")
}

func (s *testStore) UpdatePeriod(ctx context.Context, teamID string, period *models.Period) error {
	panic("not implemented")
}

func (s *testStore) GetPeriodBackups(ctx context.Context, teamID string, periodID string) (models.PeriodBackups, bool, error) {
	panic("not implemented")
}

func (s *testStore) UpsertPeriodBackups(ctx context.Context, teamID string, periodID string, backups models.PeriodBackups) error {
	panic("not implemented")
}

func (s *testStore) GetSettings(ctx context.Context) (models.Settings, error) {
	panic("not implemented")
}

func (s *testStore) Close() error {
	panic("not implemented")
}

func TestGetAllTeamsScrubbing(t *testing.T) {
	ctx := context.Background()
	s := MakeScrubbingWrapper(&testStore{teams: map[string]models.Team{
		"t1": {ID: "t1", DisplayName: "Team 1"},
		"t2": {ID: "t2", DisplayName: "Team 2"}}})
	teams, err := s.GetAllTeams(ctx)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(teams) != 2 {
		t.Errorf("expected 2 teams, got %d", len(teams))
	}
	for i, team := range teams {
		if team.Permissions.Read.Allow == nil {
			t.Errorf("team.Permissions.Read.Allow was nil for %d", i)
		}
		if team.Permissions.Write.Allow == nil {
			t.Errorf("team.Permissions.Write.Allow was nil for %d", i)
		}
	}
}

func TestGetTeamScrubbing(t *testing.T) {
	ctx := context.Background()
	s := MakeScrubbingWrapper(&testStore{teams: map[string]models.Team{
		"t1": {ID: "t1", DisplayName: "Team 1"},
	}})
	team, ok, err := s.GetTeam(ctx, "t1")
	if !ok || err != nil {
		t.Fatalf("unexpected problem: %v %v", ok, err)
	}
	if team.Permissions.Read.Allow == nil {
		t.Errorf("team.Permissions.Read.Allow was nil")
	}
	if team.Permissions.Write.Allow == nil {
		t.Errorf("team.Permissions.Write.Allow was nil")
	}
}

func TestGetAllPeriodsScrubbing(t *testing.T) {
	ctx := context.Background()
	s := MakeScrubbingWrapper(&testStore{periods: map[string]models.Period{
		"p1": {ID: "p1", DisplayName: "Period 1"},
		"p2": {ID: "p2", DisplayName: "Period 2"}}})
	periods, ok, err := s.GetAllPeriods(ctx, "myteam")
	if !ok || err != nil {
		t.Fatalf("unexpected problem: %v %v", ok, err)
	}
	if len(periods) != 2 {
		t.Errorf("expected 2 periods, got %d", len(periods))
	}
	for i, period := range periods {
		if period.People == nil {
			t.Errorf("period.People was nil for %d", i)
		}
		if period.Buckets == nil {
			t.Errorf("period.Buckets was nil for %d", i)
		}
		if period.SecondaryUnits == nil {
			t.Errorf("period.SecondaryUnits was nil for %d", i)
		}
	}
}

func TestGetPeriodScrubbing(t *testing.T) {
	ctx := context.Background()
	s := MakeScrubbingWrapper(&testStore{periods: map[string]models.Period{
		"p1": {ID: "p1", DisplayName: "Period 1", Buckets: []models.Bucket{
			{DisplayName: "Bucket 1"},
			{DisplayName: "Bucket 2", Objectives: []models.Objective{
				{Name: "Objective 1"},
			}},
		}}}})
	period, ok, err := s.GetPeriod(ctx, "myteam", "p1")
	if !ok || err != nil {
		t.Fatalf("unexpected problem: %v %v", ok, err)
	}
	if period.People == nil {
		t.Errorf("period.People was nil")
	}
	if period.Buckets == nil {
		t.Errorf("period.Buckets was nil")
	}
	if period.SecondaryUnits == nil {
		t.Errorf("period.SecondaryUnits was nil")
	}
	for i, bucket := range period.Buckets {
		if bucket.Objectives == nil {
			t.Errorf("Objectives was nil for bucket %d", i)
		}
		for j, objective := range bucket.Objectives {
			if objective.Assignments == nil {
				t.Errorf("Assignments was nil for objective %d in bucket %d", j, i)
			}
			if objective.Groups == nil {
				t.Errorf("Groups was nil for objective %d in bucket %d", j, i)
			}
			if objective.Tags == nil {
				t.Errorf("Tags was nil for objective %d in bucket %d", j, i)
			}
		}
	}
}
