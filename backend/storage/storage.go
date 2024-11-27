// Copyright 2020-21, 2024 Google LLC
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
)

// StorageService to represent the persistent store
type StorageService interface {
	GetAllTeams(ctx context.Context) ([]models.Team, error)
	GetTeam(ctx context.Context, teamID string) (models.Team, bool, error)
	CreateTeam(ctx context.Context, team models.Team) error
	UpdateTeam(ctx context.Context, team models.Team) error
	GetAllPeriods(ctx context.Context, teamID string) ([]models.Period, bool, error)
	GetPeriod(ctx context.Context, teamID, periodID string) (*models.Period, bool, error)
	CreatePeriod(ctx context.Context, teamID string, period *models.Period) error
	UpdatePeriod(ctx context.Context, teamID string, period *models.Period) error
	GetPeriodBackups(ctx context.Context, teamID, periodID string) (models.PeriodBackups, bool, error)
	UpsertPeriodBackups(ctx context.Context, teamID, periodID string, backups models.PeriodBackups) error
	GetSettings(ctx context.Context) (models.Settings, error)
	Close() error
}

// scrubbingStorage is a wrapper for a StorageService which performs certain
// scrubbing on the results, to avoid clients having to deal with quirks of
// individual storage systems, such as Cloud Datastore not saving zero-length
// slices
type scrubbingStorage struct {
	StorageService
}

// MakeScrubbingWrapper takes a storage service and scrubs its outputs
func MakeScrubbingWrapper(s StorageService) StorageService {
	return &scrubbingStorage{StorageService: s}
}

func (s *scrubbingStorage) GetAllTeams(ctx context.Context) ([]models.Team, error) {
	teams, err := s.StorageService.GetAllTeams(ctx)
	if err != nil {
		return teams, err
	}
	for i := range teams {
		scrubLoadedTeam(&teams[i])
	}
	return teams, err
}

func (s *scrubbingStorage) GetTeam(ctx context.Context, teamID string) (models.Team, bool, error) {
	team, ok, err := s.StorageService.GetTeam(ctx, teamID)
	if !ok || err != nil {
		return team, ok, err
	}
	scrubLoadedTeam(&team)
	return team, ok, err
}

func (s *scrubbingStorage) GetAllPeriods(ctx context.Context, teamID string) ([]models.Period, bool, error) {
	periods, ok, err := s.StorageService.GetAllPeriods(ctx, teamID)
	if !ok || err != nil {
		return periods, ok, err
	}
	for i := range periods {
		scrubLoadedPeriod(&periods[i])
	}
	return periods, ok, err
}

func (s *scrubbingStorage) GetPeriod(ctx context.Context, teamID, periodID string) (*models.Period, bool, error) {
	period, ok, err := s.StorageService.GetPeriod(ctx, teamID, periodID)
	if !ok || err != nil {
		return period, ok, err
	}
	scrubLoadedPeriod(period)
	return period, ok, err
}

func scrubLoadedPeriod(period *models.Period) {
	if period.People == nil {
		period.People = []models.Person{}
	}
	if period.Buckets == nil {
		period.Buckets = []models.Bucket{}
	}
	if period.SecondaryUnits == nil {
		period.SecondaryUnits = []models.SecondaryUnit{}
	}
	for i := range period.Buckets {
		if period.Buckets[i].Objectives == nil {
			period.Buckets[i].Objectives = []models.Objective{}
		}
		for j := range period.Buckets[i].Objectives {
			if period.Buckets[i].Objectives[j].Assignments == nil {
				period.Buckets[i].Objectives[j].Assignments = []models.Assignment{}
			}
			if period.Buckets[i].Objectives[j].Groups == nil {
				period.Buckets[i].Objectives[j].Groups = []models.ObjectiveGroup{}
			}
			if period.Buckets[i].Objectives[j].Tags == nil {
				period.Buckets[i].Objectives[j].Tags = []models.ObjectiveTag{}
			}
		}
	}
}

func scrubLoadedTeam(team *models.Team) {
	if team.Permissions.Read.Allow == nil {
		team.Permissions.Read.Allow = []models.UserMatcher{}
	}
	if team.Permissions.Write.Allow == nil {
		team.Permissions.Write.Allow = []models.UserMatcher{}
	}
}
