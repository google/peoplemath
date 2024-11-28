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

type testStore2 struct {
	teams   map[string]models.Team
	periods map[string]models.Period2
}

func (s *testStore2) GetAllTeams(ctx context.Context) ([]models.Team, error) {
	var teams []models.Team
	for _, t := range s.teams {
		teams = append(teams, t)
	}
	return teams, nil
}

func (s *testStore2) GetTeam(ctx context.Context, teamID string) (models.Team, error) {
	team, ok := s.teams[teamID]
	if !ok {
		return team, TeamNotFoundError(teamID)
	}
	return team, nil
}

func (s *testStore2) GetPeriodLatestVersion(ctx context.Context, teamID string, periodID string) (*models.Period2, error) {
	period, ok := s.periods[periodID]
	if !ok {
		return nil, PeriodNotFoundError(periodID)
	}
	return &period, nil
}

func (s *testStore2) UpsertPeriodLatestVersion(ctx context.Context, teamID string, period *models.Period2) (*models.Period2, error) {
	return period, nil
}

func (s *testStore2) CreateTeam(ctx context.Context, team models.Team) error {
	panic("not implemented")
}

func (s *testStore2) UpdateTeam(ctx context.Context, team models.Team) error {
	panic("not implemented")
}

func (s *testStore2) GetAllPeriods(ctx context.Context, teamID string) (*models.PeriodList, error) {
	panic("not implemented")
}

func (s *testStore2) GetSettings(ctx context.Context) (models.Settings, error) {
	panic("not implemented")
}

func (s *testStore2) Close() error {
	panic("not implemented")
}

func TestGetAllTeamsScrubbing2(t *testing.T) {
	ctx := context.Background()
	s := MakeScrubbingWrapper2(&testStore2{teams: map[string]models.Team{
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

func TestGetTeamScrubbing2(t *testing.T) {
	ctx := context.Background()
	s := MakeScrubbingWrapper2(&testStore2{teams: map[string]models.Team{
		"t1": {ID: "t1", DisplayName: "Team 1"},
	}})
	team, err := s.GetTeam(ctx, "t1")
	if err != nil {
		t.Fatalf("unexpected problem: %v", err)
	}
	if team.Permissions.Read.Allow == nil {
		t.Errorf("team.Permissions.Read.Allow was nil")
	}
	if team.Permissions.Write.Allow == nil {
		t.Errorf("team.Permissions.Write.Allow was nil")
	}
}

func TestGetPeriodLatestVersion(t *testing.T) {
	ctx := context.Background()
	s := MakeScrubbingWrapper2(&testStore2{periods: map[string]models.Period2{
		"p1": {ID: "p1", DisplayName: "Period 1", Buckets: []models.Bucket{
			{DisplayName: "Bucket 1"},
			{DisplayName: "Bucket 2", Objectives: []models.Objective{
				{Name: "Objective 1"},
			}},
		}}}})
	period, err := s.GetPeriodLatestVersion(ctx, "myteam", "p1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
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
		}
	}
}

func TestUpsertPeriodLatestVersion(t *testing.T) {
	ctx := context.Background()
	s := MakeScrubbingWrapper2(&testStore2{})
	period, err := s.UpsertPeriodLatestVersion(ctx, "myteam", &models.Period2{ID: "p1"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
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
}
