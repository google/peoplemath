// Copyright 2020-21 Google LLC
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
