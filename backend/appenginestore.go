package main

import (
	"context"
	"fmt"

	"google.golang.org/api/iterator"

	"cloud.google.com/go/datastore"
)

type appEngineStore struct {
	client *datastore.Client
}

func makeAppEngineStore(ctx context.Context, projectID string) (StorageService, error) {
	client, err := datastore.NewClient(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("Could not create datastore client: %s", err)
	}
	return &appEngineStore{client: client}, nil
}

func getTeamKey(teamID string) *datastore.Key {
	return datastore.NameKey("Team", teamID, nil)
}

func getPeriodKey(teamKey *datastore.Key, periodID string) *datastore.Key {
	return datastore.NameKey("Period", periodID, teamKey)
}

func (s *appEngineStore) GetAllTeams(ctx context.Context) ([]Team, error) {
	query := datastore.NewQuery("Team").Order("DisplayName")
	iter := s.client.Run(ctx, query)
	result := []Team{}
	for {
		var t Team
		_, err := iter.Next(&t)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return result, err
		}
		result = append(result, t)
	}
	return result, nil
}

func (s *appEngineStore) GetTeam(ctx context.Context, teamID string) (Team, bool, error) {
	key := getTeamKey(teamID)
	var team Team
	err := s.client.Get(ctx, key, &team)
	if err == datastore.ErrNoSuchEntity {
		return team, false, nil
	}
	if err != nil {
		return team, true, err
	}
	return team, true, nil
}

func (s *appEngineStore) CreateTeam(ctx context.Context, team Team) error {
	key := getTeamKey(team.ID)
	_, err := s.client.RunInTransaction(ctx, func(tx *datastore.Transaction) error {
		var empty Team
		if err := tx.Get(key, &empty); err != datastore.ErrNoSuchEntity {
			return fmt.Errorf("Expected no existing team '%s', found: %s", team.ID, err)
		}
		_, err := tx.Put(key, &team)
		return err
	})
	return err
}

func (s *appEngineStore) UpdateTeam(ctx context.Context, team Team) error {
	key := getTeamKey(team.ID)
	_, err := s.client.RunInTransaction(ctx, func(tx *datastore.Transaction) error {
		var ignored Team
		if err := tx.Get(key, &ignored); err != nil {
			return fmt.Errorf("Could not retrieve team '%s': %s", team.ID, err)
		}
		_, err := tx.Put(key, &team)
		return err
	})
	return err
}

func (s *appEngineStore) GetAllPeriods(ctx context.Context, teamID string) ([]Period, bool, error) {
	if _, ok, err := s.GetTeam(ctx, teamID); !ok || err != nil {
		return nil, false, err
	}
	teamKey := getTeamKey(teamID)
	query := datastore.NewQuery("Period").Ancestor(teamKey)
	iter := s.client.Run(ctx, query)
	result := []Period{}
	for {
		var p Period
		_, err := iter.Next(&p)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return result, true, err
		}
		result = append(result, p)
	}
	return result, true, nil
}

func (s *appEngineStore) GetPeriod(ctx context.Context, teamID, periodID string) (Period, bool, error) {
	teamKey := getTeamKey(teamID)
	periodKey := getPeriodKey(teamKey, periodID)
	var period Period
	err := s.client.Get(ctx, periodKey, &period)
	if err == datastore.ErrNoSuchEntity {
		return period, false, nil
	}
	return period, true, err
}

func (s *appEngineStore) CreatePeriod(ctx context.Context, teamID string, period Period) error {
	teamKey := getTeamKey(teamID)
	periodKey := getPeriodKey(teamKey, period.ID)
	_, err := s.client.RunInTransaction(ctx, func(tx *datastore.Transaction) error {
		var empty Period
		if err := tx.Get(periodKey, &empty); err != datastore.ErrNoSuchEntity {
			return fmt.Errorf("Expected no period '%s' for team '%s': %s", period.ID, teamID, err)
		}
		_, err := tx.Put(periodKey, &period)
		return err
	})
	return err
}

func (s *appEngineStore) UpdatePeriod(ctx context.Context, teamID string, period Period) error {
	teamKey := getTeamKey(teamID)
	periodKey := getPeriodKey(teamKey, period.ID)
	_, err := s.client.RunInTransaction(ctx, func(tx *datastore.Transaction) error {
		var ignored Period
		if err := tx.Get(periodKey, &ignored); err != nil {
			return fmt.Errorf("Could not retrieve period '%s' for team '%s': %s", period.ID, teamID, err)
		}
		_, err := tx.Put(periodKey, &period)
		return err
	})
	return err
}

func (s *appEngineStore) Close() error {
	return s.client.Close()
}
