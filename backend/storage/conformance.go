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
	"strings"
	"testing"

	"github.com/google/go-cmp/cmp"
)

const (
	teamID   = "myteam"
	periodID = "pd1"
)

func testTeams(ctx context.Context, s StorageService2, t *testing.T) {
	teams, err := s.GetAllTeams(ctx)
	if err != nil {
		t.Errorf("GetAllTeams returned error: %v", err)
		return
	}
	if len(teams) != 0 {
		t.Errorf("Expected 0 teams, found %v", len(teams))
	}

	team := models.Team{
		ID:          teamID,
		DisplayName: "My team",
	}
	err = s.CreateTeam(ctx, team)
	if err != nil {
		t.Errorf("CreateTeam returned error: %v", err)
		return
	}

	teams, err = s.GetAllTeams(ctx)
	if err != nil {
		t.Errorf("GetAllTeams returned error: %v", err)
		return
	}
	if len(teams) != 1 {
		t.Errorf("Expected 1 team, found %v", len(teams))
	}

	loadedTeam, err := s.GetTeam(ctx, teamID)
	if err != nil {
		t.Errorf("GetTeam returned error: %v", err)
		return
	}
	if loadedTeam.ID != teamID || loadedTeam.DisplayName != "My team" {
		t.Errorf("Loaded team did not match what was saved: %v", loadedTeam)
	}
}

func testPeriods(ctx context.Context, s StorageService2, t *testing.T) {
	periodList, err := s.GetAllPeriods(ctx, teamID)
	if err != nil {
		t.Errorf("GetAllPeriods returned error: %v", err)
		return
	}
	if len(periodList.Periods) != 0 {
		t.Errorf("Expected no periods, found %v", len(periodList.Periods))
	}

	_, err = s.GetAllPeriods(ctx, "doesnotexist")
	if _, ok := err.(TeamNotFoundError); !ok {
		t.Errorf("Expected TeamNotFoundError on GetAllPeriods for non-existent team, found %v", err)
	}
	_, err = s.UpsertPeriodLatestVersion(ctx, "doesnotexist", &models.Period2{})
	if _, ok := err.(TeamNotFoundError); !ok {
		t.Errorf("Expected TeamNotFoundError on UpsertPeriodLatestVersion for non-existent team, found %v", err)
	}
	_, err = s.GetPeriodLatestVersion(ctx, "doesnotexist", periodID)
	if _, ok := err.(TeamNotFoundError); !ok {
		t.Errorf("Expected TeamNotFoundError on GetPeriodLatestVersion for non-existent team, found %v", err)
	}
	_, err = s.GetPeriodLatestVersion(ctx, teamID, "doesnotexist")
	if _, ok := err.(PeriodNotFoundError); !ok {
		t.Errorf("Expected PeriodNotFoundError on GetPeriodLatestVersion for non-existent period, found %v", err)
	}

	period := models.Period2{
		ID:          periodID,
		DisplayName: "My test period",
	}

	_, err = s.UpsertPeriodLatestVersion(ctx, teamID, &period)
	if err == nil {
		t.Error("Expected error saving period without version")
	}

	period.Version = "v1"
	savedPeriod, err := s.UpsertPeriodLatestVersion(ctx, teamID, &period)
	if err != nil {
		t.Errorf("UpsertPeriodLatestVersion gave error: %v", err)
	}
	if len(savedPeriod.ParentVersions) != 0 {
		t.Errorf("Initial saved period has ParentVersions %v", savedPeriod.ParentVersions)
	}

	savedPeriod, err = s.GetPeriodLatestVersion(ctx, teamID, periodID)
	if err != nil {
		t.Errorf("GetPeriodLatestVersion gave error: %v", err)
	}
	if savedPeriod.Version != "v1" {
		t.Errorf("Expected v1 to be latest, found '%v'", savedPeriod.Version)
	}

	updatedPeriod := models.Period2{
		ID:          periodID,
		DisplayName: "My updated test period",
		Version:     "v2",
	}
	_, err = s.UpsertPeriodLatestVersion(ctx, teamID, &updatedPeriod)
	if err == nil {
		t.Error("UpsertPeriodLatestVersion on existing period with no parent version succeeded")
	}
	updatedPeriod.ParentVersions = []string{"v17"}
	_, err = s.UpsertPeriodLatestVersion(ctx, teamID, &updatedPeriod)
	if err == nil {
		t.Error("UpsertPeriodLatestVersion with non-existent parent version succeeded")
	}
	updatedPeriod.ParentVersions = []string{"v1"}
	savedPeriod, err = s.UpsertPeriodLatestVersion(ctx, teamID, &updatedPeriod)
	if err != nil {
		t.Errorf("UpsertPeriodLatestVersion update returned error: %v", err)
	}
	if savedPeriod.Version != "v2" {
		t.Errorf("Version in saved period expected v2, got '%v'", savedPeriod.Version)
	}
	savedPeriod, err = s.GetPeriodLatestVersion(ctx, teamID, periodID)
	if err != nil {
		t.Errorf("GetPeriodLatestVersion returned error: %v", err)
	}
	if savedPeriod.Version != "v2" {
		t.Errorf("Saved period version expected v2, got '%v'", savedPeriod.Version)
	}

	_, err = s.UpsertPeriodLatestVersion(ctx, teamID, &updatedPeriod)
	if err == nil {
		t.Error("UpsertPeriodLatestVersion succeeded with existing version")
	}

	_, err = s.UpsertPeriodLatestVersion(ctx, teamID, &models.Period2{ID: "mynew", Version: "v1", ParentVersions: []string{"foo"}})
	if err == nil {
		t.Error("UpsertPeriodLatestVersion succeeded with new period with parent versions")
	}

	testPeriodMerging(ctx, s, t)
}

func testPeriodMerging(ctx context.Context, s StorageService2, t *testing.T) {
	updatedPeriod := models.Period2{
		ID:             periodID,
		DisplayName:    "My updated test period",
		Unit:           "Updated unit",
		Version:        "v3",
		ParentVersions: []string{"v1"},
	}
	// Should be safe as it updates an unrelated field
	savedPeriod, err := s.UpsertPeriodLatestVersion(ctx, teamID, &updatedPeriod)
	if err != nil {
		t.Errorf("unexpected upsert failure: %v", err)
	}
	expectedPeriod := &models.Period2{
		ID:             periodID,
		DisplayName:    "My updated test period",
		Unit:           "Updated unit",
		Version:        "v3",
		ParentVersions: []string{"v2", "v1"},
	}
	if diff := cmp.Diff(expectedPeriod, savedPeriod); diff != "" {
		t.Errorf("unexpected saved period (-want +got):\n%s", diff)
	}

	conflictingUpdate := models.Period2{
		ID:             periodID,
		DisplayName:    "My conflicting display name",
		Version:        "v4",
		ParentVersions: []string{"v1"},
	}
	_, err = s.UpsertPeriodLatestVersion(ctx, teamID, &conflictingUpdate)
	if _, ok := err.(ConcurrentModificationError); !ok {
		t.Errorf("expected ConcurrentModificationError, found %v", err)
	}
	if !strings.Contains(err.Error(), "DisplayName: conflicting updates") {
		t.Errorf("unexpected error message: %v", err)
	}

	savedPeriod, err = s.GetPeriodLatestVersion(ctx, teamID, periodID)
	if err != nil {
		t.Errorf("unexpected get failure: %v", err)
	}
	if diff := cmp.Diff(expectedPeriod, savedPeriod); diff != "" {
		t.Errorf("unexpected saved period (-want +got):\n%s", diff)
	}
}

func TestStorageConformance(s StorageService2, t *testing.T) {
	ctx := context.Background()
	testTeams(ctx, s, t)
	testPeriods(ctx, s, t)
}
