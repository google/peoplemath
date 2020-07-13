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
	GetPeriod(ctx context.Context, teamID, periodID string) (models.Period, bool, error)
	CreatePeriod(ctx context.Context, teamID string, period models.Period) error
	UpdatePeriod(ctx context.Context, teamID string, period models.Period) error
	GetSettings(ctx context.Context) (models.Settings, error)
	Close() error
}
