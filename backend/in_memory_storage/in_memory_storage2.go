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

package in_memory_storage

import (
	"context"
	"fmt"
	"log"
	"peoplemath/merge"
	"peoplemath/models"
	"peoplemath/storage"
	"strings"
	"sync"

	"github.com/google/uuid"
)

// InMemStore2 is an in-memory implementation of StorageService2, for local testing.
// This should eventually replace InMemStore as part of https://github.com/google/peoplemath/issues/214.
type InMemStore2 struct {
	teams map[string]models.Team
	// Team ID -> period ID -> version
	latestPeriodIDs map[string]map[string]string
	// Team ID -> period ID -> version -> period
	periods  map[string]map[string]map[string]models.Period2
	settings models.Settings
	// Mutex for protection against data races
	mu sync.Mutex
}

// MakeEmptyInMemStore creates an InMemStore with no pre-populated contents.
func MakeEmptyInMemStore() *InMemStore2 {
	return &InMemStore2{
		teams:           make(map[string]models.Team),
		latestPeriodIDs: make(map[string]map[string]string),
		periods:         make(map[string]map[string]map[string]models.Period2),
	}
}

// MakeInMemStore2 creates an InMemStore2 with pre-populated content suitable for interactive testing.
// The defaultDomain can be specified as a flag when running the application
// All permissions will have the defaultDomain in the Allow list,
// so the application can manually tested with authentication & authorization enabled
func MakeInMemStore2(defaultDomain string) *InMemStore2 {
	defaultPermissionList := models.Permission{Allow: []models.UserMatcher{{
		Type: models.UserMatcherTypeDomain,
		ID:   defaultDomain,
	}}}
	teamPermissions := models.TeamPermissions{
		Read:  defaultPermissionList,
		Write: defaultPermissionList,
	}

	teams := map[string]models.Team{
		"team1": {ID: "team1", DisplayName: "Team team1", Permissions: teamPermissions},
		"team2": {ID: "team2", DisplayName: "Team team2", Permissions: teamPermissions},
	}
	generalPermissions := models.GeneralPermissions{
		ReadTeamList: defaultPermissionList,
		AddTeam:      defaultPermissionList,
	}
	periods := map[string][]models.Period2{
		"team1": {
			makeFakePeriod2("2018q4"),
			makeFakePeriod2("2019q1"),
			makeLargePeriod2("2020q3", 30, 3, 50),
			makeFakePeriodWithFixedBuckets2("2023q3"),
		},
		"team2": {
			makeFakePeriod2("2018q4"),
		},
		"teamAuthTest": {
			makeFakePeriod2("2019q1"),
		},
	}
	latestPeriodIDs := make(map[string]map[string]string)
	periodsByVersion := make(map[string]map[string]map[string]models.Period2)
	for teamID, teamPeriods := range periods {
		var teamLatestPeriods map[string]string
		var ok bool
		if teamLatestPeriods, ok = latestPeriodIDs[teamID]; !ok {
			teamLatestPeriods = make(map[string]string)
			latestPeriodIDs[teamID] = teamLatestPeriods
		}
		var teamPeriodsByVersion map[string]map[string]models.Period2
		if teamPeriodsByVersion, ok = periodsByVersion[teamID]; !ok {
			teamPeriodsByVersion = make(map[string]map[string]models.Period2)
			periodsByVersion[teamID] = teamPeriodsByVersion
		}
		for _, period := range teamPeriods {
			teamLatestPeriods[period.ID] = period.Version
			var periodVersions map[string]models.Period2
			if periodVersions, ok = teamPeriodsByVersion[period.ID]; !ok {
				periodVersions = make(map[string]models.Period2)
				teamPeriodsByVersion[period.ID] = periodVersions
			}
			periodVersions[period.Version] = period
		}
	}

	return &InMemStore2{
		teams:           teams,
		latestPeriodIDs: latestPeriodIDs,
		periods:         periodsByVersion,
		settings: models.Settings{
			ImproveURL:         "https://github.com/google/peoplemath",
			GeneralPermissions: generalPermissions,
		},
	}
}

// AddAuthTestUsersAndTeam adds some test users plus a team, for unit tests
func (s *InMemStore2) AddAuthTestUsersAndTeam() {
	s.mu.Lock()
	defer s.mu.Unlock()

	userAEmail := "userA@domain.com"
	userBDomain := "userB.com"
	userCEmail := "userC@domain.com"

	permissionsList := models.Permission{Allow: []models.UserMatcher{{
		Type: models.UserMatcherTypeEmail,
		ID:   userAEmail,
	}, {
		Type: models.UserMatcherTypeDomain,
		ID:   userBDomain,
	}}}
	permissionsListInclC := permissionsList
	permissionsListInclC.Allow = append(permissionsListInclC.Allow, models.UserMatcher{
		Type: models.UserMatcherTypeEmail,
		ID:   userCEmail,
	})

	teamPermissions := models.TeamPermissions{
		Read:  permissionsListInclC,
		Write: permissionsList,
	}

	generalPermission := models.GeneralPermissions{
		ReadTeamList: permissionsListInclC,
		AddTeam:      permissionsList,
	}

	s.teams["teamAuthTest"] = models.Team{ID: "teamAuthTest", DisplayName: "Team authTest", Permissions: teamPermissions}
	s.settings.GeneralPermissions = generalPermission
}

func (s *InMemStore2) GetAllTeams(ctx context.Context) ([]models.Team, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	teamsSlice := make([]models.Team, 0, len(s.teams))
	for _, t := range s.teams {
		teamsSlice = append(teamsSlice, t)
	}
	return teamsSlice, nil
}

func (s *InMemStore2) GetTeam(ctx context.Context, teamID string) (models.Team, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	team, ok := s.teams[teamID]
	if !ok {
		return team, storage.TeamNotFoundError(teamID)
	}
	return team, nil
}

func (s *InMemStore2) CreateTeam(ctx context.Context, team models.Team) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.teams[team.ID]; ok {
		return fmt.Errorf("team already exists: %s", team.ID)
	}

	s.teams[team.ID] = team
	s.latestPeriodIDs[team.ID] = map[string]string{}
	s.periods[team.ID] = map[string]map[string]models.Period2{}
	log.Printf("Added new team %s", team.ID)
	return nil
}

func (s *InMemStore2) UpdateTeam(ctx context.Context, team models.Team) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.teams[team.ID]; !ok {
		return storage.TeamNotFoundError(team.ID)
	}

	s.teams[team.ID] = team
	log.Printf("Updated team %s", team.ID)
	return nil
}

func (s *InMemStore2) GetAllPeriods(ctx context.Context, teamID string) (*models.PeriodList, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	var latestPeriodIDs map[string]string
	var ok bool
	if latestPeriodIDs, ok = s.latestPeriodIDs[teamID]; !ok {
		return nil, storage.TeamNotFoundError(teamID)
	}

	var periods []models.PeriodListItem
	for periodID, periodVersion := range latestPeriodIDs {
		period := s.periods[teamID][periodID][periodVersion]
		periods = append(periods, models.PeriodListItem{
			Name: period.DisplayName,
			ID:   periodID,
		})
	}

	return &models.PeriodList{
		Periods: periods,
	}, nil
}

func (s *InMemStore2) periodLatestVersion(teamID, periodID string) (*models.Period2, error) {
	var latestPeriodIDs map[string]string
	var ok bool
	if latestPeriodIDs, ok = s.latestPeriodIDs[teamID]; !ok {
		return nil, storage.TeamNotFoundError(teamID)
	}

	var latestPeriodID string
	if latestPeriodID, ok = latestPeriodIDs[periodID]; !ok {
		return nil, storage.PeriodNotFoundError(periodID)
	}

	var periodVersions map[string]models.Period2
	if periodVersions, ok = s.periods[teamID][periodID]; !ok {
		return nil, storage.PeriodNotFoundError(periodID)
	}

	period := periodVersions[latestPeriodID]
	return &period, nil
}

func (s *InMemStore2) GetPeriodLatestVersion(ctx context.Context, teamID, periodID string) (*models.Period2, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	return s.periodLatestVersion(teamID, periodID)
}

type inMemPeriodLookup map[string]models.Period2

func (s inMemPeriodLookup) GetPeriodVersion(version string) (*models.Period2, bool) {
	res, ok := s[version]
	return &res, ok
}

func (s *InMemStore2) UpsertPeriodLatestVersion(ctx context.Context, teamID string, period *models.Period2) (*models.Period2, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.latestPeriodIDs[teamID]; !ok {
		return nil, storage.TeamNotFoundError(teamID)
	}
	if period.Version == "" {
		return nil, fmt.Errorf("period has no version")
	}

	latestVersion, err := s.periodLatestVersion(teamID, period.ID)
	if err == nil {
		// There is an existing period.
		// period.Version should already have been set to a new unique value.
		if _, ok := s.periods[teamID][period.ID][period.Version]; ok {
			return nil, fmt.Errorf("period already exists with version '%s'", period.Version)
		}
		if len(period.ParentVersions) != 1 {
			return nil, fmt.Errorf("period should have exactly one parent version, found %d", len(period.ParentVersions))
		}
		if _, ok := s.periods[teamID][period.ID][period.ParentVersions[0]]; !ok {
			return nil, fmt.Errorf("parent version '%s' does not exist", period.ParentVersions[0])
		}

		base, err := merge.MergeBaseVersion(inMemPeriodLookup(s.periods[teamID][period.ID]), period.ParentVersions[0], latestVersion.Version)
		if err != nil {
			return nil, fmt.Errorf("unable to find common parent for versions %s, %s: %v",
				period.ParentVersions[0], latestVersion.Version, err)
		}
		var merger merge.PeriodMerger
		merged := merger.MergePeriods(base, latestVersion, period)
		if !merger.MergeSuccessful() {
			return nil, storage.ConcurrentModificationError(fmt.Sprintf(
				"unable to merge period into latest %s versus base %s: %s",
				latestVersion.Version, base.Version, merger.ErrorSummary()))
		}
		s.latestPeriodIDs[teamID][period.ID] = merged.Version
		s.periods[teamID][period.ID][merged.Version] = *merged
		return merged, nil
	} else if _, ok := err.(storage.PeriodNotFoundError); ok {
		if len(period.ParentVersions) != 0 {
			return nil, fmt.Errorf("unexpected ParentVersions on new period: %s", strings.Join(period.ParentVersions, ", "))
		}
		// There is no existing period. Just save this as the new version.
		var periodVersions map[string]models.Period2
		if periodVersions, ok = s.periods[teamID][period.ID]; !ok {
			periodVersions = make(map[string]models.Period2)
			s.periods[teamID][period.ID] = periodVersions
		}
		periodVersions[period.Version] = *period
		s.latestPeriodIDs[teamID][period.ID] = period.Version
		return period, nil
	} else {
		return nil, err
	}
}

func (s *InMemStore2) GetSettings(ctx context.Context) (models.Settings, error) {
	return s.settings, nil
}

func (s *InMemStore2) Close() error {
	return nil
}

func makeFakePeriod2(id string) models.Period2 {
	buckets := []models.Bucket{
		{
			DisplayName:          "First bucket",
			AllocationPercentage: 40,
			Objectives: []models.Objective{
				{
					Name:             "First objective",
					ResourceEstimate: 10,
					CommitmentType:   "Committed",
					Assignments: []models.Assignment{
						{
							PersonID:   "alice",
							Commitment: 5,
						},
						{
							PersonID:   "bob",
							Commitment: 5,
						},
					},
					Groups: []models.ObjectiveGroup{
						{
							GroupType: "Project",
							GroupName: "Project 1",
						},
					},
					Tags: []models.ObjectiveTag{},
				},
				{
					Name:             "Second objective",
					ResourceEstimate: 15,
					CommitmentType:   "Aspirational",
					Notes:            "Some notes",
					Assignments: []models.Assignment{
						{
							PersonID:   "bob",
							Commitment: 2,
						},
					},
					Groups: []models.ObjectiveGroup{
						{
							GroupType: "Project",
							GroupName: "Project 2",
						},
					},
					Tags: []models.ObjectiveTag{
						{
							Name: "tag1",
						},
						{
							Name: "tag2",
						},
					},
				},
				{
					Name:             "Block objective 1",
					ResourceEstimate: 1,
					CommitmentType:   "Aspirational",
					Notes:            "",
					Assignments:      []models.Assignment{},
					Groups:           []models.ObjectiveGroup{},
					Tags:             []models.ObjectiveTag{},
					BlockID:          "block1",
				},
				{
					Name:             "Block objective 2",
					ResourceEstimate: 2,
					CommitmentType:   "Aspirational",
					Notes:            "",
					Assignments:      []models.Assignment{},
					Groups:           []models.ObjectiveGroup{},
					Tags:             []models.ObjectiveTag{},
					BlockID:          "block1",
				},
				{
					Name:             "Block objective 3",
					ResourceEstimate: 3,
					CommitmentType:   "Aspirational",
					Notes:            "",
					Assignments:      []models.Assignment{},
					Groups:           []models.ObjectiveGroup{},
					Tags:             []models.ObjectiveTag{},
					BlockID:          "block1",
				},
			},
		},
		{
			DisplayName:          "Second bucket",
			AllocationPercentage: 40,
			Objectives: []models.Objective{
				{
					Name:             "Third objective",
					ResourceEstimate: 2,
					CommitmentType:   "Aspirational",
					Assignments:      []models.Assignment{},
					Groups: []models.ObjectiveGroup{
						{
							GroupType: "Project",
							GroupName: "Project 1",
						},
					},
					Tags: []models.ObjectiveTag{},
				},
				{
					Name: "A really long objective name to show what happens when these things get really " +
						"very long indeed. Look, this objective really is quite long, and it's good to know " +
						"what happens in the UI in that case. If I just keep going and going and going, does " +
						"the text start to overlap with other objectives? Let's add even more text to make this " +
						"really really really really clear",
					ResourceEstimate: 5,
					CommitmentType:   "Committed",
					Assignments:      []models.Assignment{},
					Groups:           []models.ObjectiveGroup{},
					Tags:             []models.ObjectiveTag{},
				},
				{
					Name:             "Fourth objective",
					ResourceEstimate: 8,
					CommitmentType:   "Aspirational",
					Assignments: []models.Assignment{
						{
							PersonID:   "charlie",
							Commitment: 8,
						},
					},
					Groups: []models.ObjectiveGroup{
						{
							GroupType: "Project",
							GroupName: "Project 1",
						},
					},
					Tags: []models.ObjectiveTag{
						{
							Name: "tag2",
						},
					},
				},
			},
		},
		{
			DisplayName:          "Third bucket",
			AllocationPercentage: 20,
			Objectives: []models.Objective{
				{
					Name:             "A Markdown-formatted objective **with bold**, some `code` and [a link](https://github.com/google/peoplemath)",
					ResourceEstimate: 5,
					CommitmentType:   "Aspirational",
					Assignments: []models.Assignment{
						{
							PersonID:   "zoe",
							Commitment: 5,
						},
					},
					Groups:         []models.ObjectiveGroup{},
					Tags:           []models.ObjectiveTag{},
					DisplayOptions: models.DisplayOptions{EnableMarkdown: true},
				},
			},
		},
	}
	people := []models.Person{
		{
			ID:           "alice",
			DisplayName:  "Alice Atkins",
			Location:     "LON",
			Availability: 5,
		},
		{
			ID:           "bob",
			DisplayName:  "Bob Brewster",
			Location:     "LON",
			Availability: 7,
		},
		{
			ID:           "charlie",
			DisplayName:  "Charlie Case",
			Location:     "SVL",
			Availability: 8,
		},
		{
			ID:           "zoe",
			DisplayName:  "Zoe Zimmerman",
			Location:     "SVL",
			Availability: 8,
		},
	}
	return models.Period2{
		ID:          id,
		DisplayName: strings.ToUpper(id),
		Unit:        "person weeks",
		UnitAbbrev:  "pw",
		SecondaryUnits: []models.SecondaryUnit{
			{
				Name:             "person years",
				ConversionFactor: 7.0 / 365.0,
			},
		},
		NotesURL:               "https://github.com/google/peoplemath",
		MaxCommittedPercentage: 50,
		Buckets:                buckets,
		People:                 people,
		Version:                uuid.NewString(),
	}
}

func makeFakePeriodWithFixedBuckets2(id string) models.Period2 {
	period := makeFakePeriod2(id)
	period.DisplayName += " (with fixed bucket)"
	period.Buckets = append(period.Buckets, models.Bucket{
		DisplayName:        "A bucket with fixed allocation",
		AllocationType:     models.AllocationTypeAbsolute,
		AllocationAbsolute: 6,
		Objectives: []models.Objective{
			{
				Name:             "Finish some of the stuff in the fixed bucket",
				ResourceEstimate: 2,
			},
			{
				Name:             "Finish the rest of the stuff in the fixed bucket",
				ResourceEstimate: 4,
				Notes:            "Because it's really important",
			},
		},
	})
	return period
}

// Make a period with lots of objectives, people, assignments etc.
// This is useful for performance testing the UI at realistic scale.
func makeLargePeriod2(id string, personCount, bucketCount, objectivesPerBucket int) models.Period2 {
	people := make([]models.Person, personCount)
	for i := 0; i < personCount; i++ {
		people[i] = models.Person{
			ID:           makeRandomString(10),
			DisplayName:  "",
			Location:     strings.ToUpper(makeRandomString(3)),
			Availability: 10,
		}
	}
	timeRemaining := make(map[string]float64)
	for _, person := range people {
		timeRemaining[person.ID] = person.Availability
	}

	objFactory := randomObjectiveFactory{
		peopleTimeRemaining: timeRemaining,
		allProjects:         []string{"Project 1", "Project 2", "Project 3", "Project 4", "Project 5"},
	}
	buckets := make([]models.Bucket, bucketCount)
	var allocRemaining = 100
	for i := 0; i < bucketCount; i++ {
		allocPct := allocRemaining / (bucketCount - i)
		objectives := make([]models.Objective, objectivesPerBucket)
		for j := 0; j < objectivesPerBucket; j++ {
			objectives[j] = objFactory.makeRandomObjective()
		}
		buckets[i] = models.Bucket{
			DisplayName:          fmt.Sprintf("Bucket %v", i+1),
			AllocationPercentage: float64(allocPct),
			Objectives:           objectives,
		}
		allocRemaining -= allocPct
	}

	return models.Period2{
		ID:          id,
		DisplayName: fmt.Sprintf("Large period %v for UI stress testing", strings.ToUpper(id)),
		Unit:        "person weeks",
		SecondaryUnits: []models.SecondaryUnit{
			{Name: "person years", ConversionFactor: 7.0 / 365.0},
		},
		NotesURL:               "https://github.com/google/peoplemath",
		MaxCommittedPercentage: 50,
		Buckets:                buckets,
		People:                 people,
		Version:                uuid.NewString(),
	}
}
