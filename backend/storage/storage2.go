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
	"fmt"
	"peoplemath/models"
)

// StorageService2 to represent the persistent store.
// This type will eventually replace StorageService. It is a replacement which implements new
// period-related functions to address https://github.com/google/peoplemath/issues/214.
type StorageService2 interface {
	GetAllTeams(ctx context.Context) ([]models.Team, error)
	// GetTeam returns the team with a given ID.
	// (If the team does not exist then TeamNotFoundError should be returned.)
	GetTeam(ctx context.Context, teamID string) (models.Team, error)
	CreateTeam(ctx context.Context, team models.Team) error
	// UpdateTeam updates a team based on ID.
	// (If the team does not exist then TeamNotFoundError should be returned.)
	UpdateTeam(ctx context.Context, team models.Team) error

	// GetAllPeriods retrieves all valid periods for a given team.
	// (If the team doesn't exist then TeamNotFoundError should be returned.)
	GetAllPeriods(ctx context.Context, teamID string) (*models.PeriodList, error)
	// GetPeriodLatestVersion retrieves the latest version of a period.
	// (If the period does not exist then PeriodNotFoundError should be returned.)
	GetPeriodLatestVersion(ctx context.Context, teamID, periodID string) (*models.Period2, error)
	// UpsertPeriodLatestVersion sets the latest version of a period.
	// If the period does not already exist then it should be created, and the provided value saved as the latest.
	// If the period does exist, and the latest existing version is the parent of the provided version,
	// then there have been no concurrent changes, and the provided value should be saved as the new latest.
	// (It is assumed that the Version of the provided period has been set to a new unique value,
	// and that the ParentVersion has been set to the Version from which it was derived, by the caller.)
	// If the period exists and the latest existing version is *not* the parent of the provided version,
	// then a concurrent change has taken place. A merge should be performed to combine the user's changes
	// with the concurrent changes.
	// If this merge is successful, the merged value should be saved as the new latest, as the parent of
	// the previous latest. If unsuccessful, a ConcurrentModificationError should be returned.
	// These updates should be performed with a transaction isolation level sufficient to prevent lost updates.
	UpsertPeriodLatestVersion(ctx context.Context, teamID string, period *models.Period2) (*models.Period2, error)

	GetSettings(ctx context.Context) (models.Settings, error)
	Close() error
}

type TeamNotFoundError string

func (e TeamNotFoundError) Error() string {
	return fmt.Sprintf("Team not found: %s", string(e))
}

type PeriodNotFoundError string

func (e PeriodNotFoundError) Error() string {
	return fmt.Sprintf("Period not found: %s", string(e))
}

type ConcurrentModificationError string

func (e ConcurrentModificationError) Error() string {
	return fmt.Sprintf("Concurrent modification error: %s", string(e))
}

// scrubbingStorage2 is a wrapper for a StorageService which performs certain
// scrubbing on the results, to avoid clients having to deal with quirks of
// individual storage systems, such as Cloud Datastore not saving zero-length
// slices
type scrubbingStorage2 struct {
	StorageService2
}

// MakeScrubbingWrapper takes a storage service and scrubs its outputs
func MakeScrubbingWrapper2(s StorageService2) StorageService2 {
	return &scrubbingStorage2{StorageService2: s}
}

func (s *scrubbingStorage2) GetAllTeams(ctx context.Context) ([]models.Team, error) {
	teams, err := s.StorageService2.GetAllTeams(ctx)
	if err != nil {
		return teams, err
	}
	for i := range teams {
		scrubLoadedTeam(&teams[i])
	}
	return teams, err
}

func (s *scrubbingStorage2) GetTeam(ctx context.Context, teamID string) (models.Team, error) {
	team, err := s.StorageService2.GetTeam(ctx, teamID)
	if err != nil {
		return team, err
	}
	scrubLoadedTeam(&team)
	return team, err
}

func (s *scrubbingStorage2) GetPeriodLatestVersion(ctx context.Context, teamID, periodID string) (*models.Period2, error) {
	period, err := s.StorageService2.GetPeriodLatestVersion(ctx, teamID, periodID)
	if err != nil {
		return period, err
	}
	scrubLoadedPeriod2(period)
	return period, err
}

func (s *scrubbingStorage2) UpsertPeriodLatestVersion(ctx context.Context, teamID string, period *models.Period2) (*models.Period2, error) {
	period, err := s.StorageService2.UpsertPeriodLatestVersion(ctx, teamID, period)
	if err != nil {
		return period, err
	}
	scrubLoadedPeriod2(period)
	return period, err
}

func scrubLoadedPeriod2(period *models.Period2) {
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
