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
	"fmt"
	"log"
	"math/rand"
	"peoplemath/models"
	"peoplemath/storage"
	"strings"
)

// In-memory implementation of StorageService, for local testing
type inMemStore struct {
	generalPermissions models.GeneralPermissions
	teams              map[string]models.Team
	periods            map[string]map[string]models.Period
	settings           models.Settings
}

func MakeInMemStore(defaultDomain string) storage.StorageService {
	defaultPermissionList := models.Permission{Allow: []models.Principal{{
		Type: models.PrincipalTypeDomain,
		ID:   defaultDomain,
	}}}
	teamPermissions := models.TeamPermissions{
		Read:  defaultPermissionList,
		Write: defaultPermissionList,
	}
	userAEmail := "userA@userA.com"
	userBDomain := "userB.com"
	testPermissionList := models.Permission{Allow: []models.Principal{{
		Type: models.PrincipalTypeEmail,
		ID:   userAEmail,
	}, {
		Type: models.PrincipalTypeDomain,
		ID:   userBDomain,
	}, {
		Type: models.PrincipalTypeDomain,
		ID:   defaultDomain,
	}}}
	authTestTeamPermissions := models.TeamPermissions{
		Read:  testPermissionList,
		Write: testPermissionList,
	}
	teams := map[string]models.Team{
		"team1":        {ID: "team1", DisplayName: "Team team1", Permissions: teamPermissions},
		"team2":        {ID: "team2", DisplayName: "Team team2", Permissions: teamPermissions},
		"teamAuthTest": {ID: "teamAuthTest", DisplayName: "Team authTest", Permissions: authTestTeamPermissions},
	}
	generalPermissions := models.GeneralPermissions{
		ReadTeamList: testPermissionList,
		AddTeam:      testPermissionList,
	}
	periods := map[string]map[string]models.Period{
		"team1": {
			"2018q4": makeFakePeriod("2018q4"),
			"2019q1": makeFakePeriod("2019q1"),
			"2020q3": makeLargePeriod("2020q3", 30, 3, 50),
		},
		"team2": {
			"2018q4": makeFakePeriod("2018q4"),
		},
		"teamAuthTest": {
			"2019q1": makeFakePeriod("2019q1"),
		},
	}
	settings := models.Settings{
		ImproveURL: "https://github.com/google/peoplemath",
	}
	return &inMemStore{teams: teams, periods: periods, settings: settings, generalPermissions: generalPermissions}
}

func (s *inMemStore) GetGeneralPermissions(ctx context.Context) (models.GeneralPermissions, error) {
	return s.generalPermissions, nil
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

type randomObjectiveFactory struct {
	peopleTimeRemaining map[string]float64
	allProjects         []string
}

func (f *randomObjectiveFactory) pickRandomPersonWithTimeLeft() (string, float64) {
	chooseIdx := rand.Intn(len(f.peopleTimeRemaining))
	idx := 0
	for personID, remaining := range f.peopleTimeRemaining {
		if idx == chooseIdx {
			return personID, remaining
		}
		idx++
	}
	panic(fmt.Sprintf("Could not select a random person, chooseIdx = %v, len = %v", chooseIdx, len(f.peopleTimeRemaining)))
}

func (f *randomObjectiveFactory) randomCommitment(personTimeRemaining, resourcesRequired float64) float64 {
	var commitment float64
	if personTimeRemaining > 1 {
		commitment = float64(rand.Intn(int(personTimeRemaining)-1) + 1)
	} else {
		commitment = 1
	}
	if commitment > resourcesRequired {
		commitment = resourcesRequired
	}
	return commitment
}

func (f *randomObjectiveFactory) makeRandomObjective() models.Objective {
	resourceEstimate := float64(rand.Intn(50))
	var ctype string
	if rand.Float64() < 0.3 {
		ctype = models.CommitmentTypeCommitted
	} else {
		ctype = models.CommitmentTypeAspirational
	}
	assignmentCount := rand.Intn(3)
	assignments := make([]models.Assignment, assignmentCount)
	resourcesRequired := resourceEstimate
	for i := 0; i < assignmentCount; i++ {
		if len(f.peopleTimeRemaining) == 0 {
			// Nobody has any time left
			break
		}
		personID, personTimeRemaining := f.pickRandomPersonWithTimeLeft()
		commitment := f.randomCommitment(personTimeRemaining, resourcesRequired)
		assignments[i] = models.Assignment{
			PersonID:   personID,
			Commitment: commitment,
		}
		resourcesRequired -= commitment
		f.peopleTimeRemaining[personID] -= commitment
		if f.peopleTimeRemaining[personID] == 0 {
			delete(f.peopleTimeRemaining, personID)
		}
		break
	}

	tags := make([]models.ObjectiveTag, 0, 1)
	if rand.Float64() < 0.1 {
		tags = append(tags, models.ObjectiveTag{Name: "mytag"})
	}

	return models.Objective{
		Name:             fmt.Sprintf("%v the %v", makeRandomString(rand.Intn(20)+3), makeRandomString(rand.Intn(20)+3)),
		ResourceEstimate: float64(resourceEstimate),
		CommitmentType:   ctype,
		Assignments:      assignments,
		Groups: []models.ObjectiveGroup{
			models.ObjectiveGroup{
				GroupType: "Project",
				GroupName: f.allProjects[rand.Intn(len(f.allProjects))],
			},
		},
		Tags: tags,
	}
}

// Make a period with lots of objectives, people, assignments etc.
// This is useful for performance testing the UI at realistic scale.
func makeLargePeriod(id string, personCount, bucketCount, objectivesPerBucket int) models.Period {
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
	var allocRemaining int = 100
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

	return models.Period{
		ID:          id,
		DisplayName: fmt.Sprintf("Large period %v for UI stress testing", strings.ToUpper(id)),
		Unit:        "person weeks",
		SecondaryUnits: []models.SecondaryUnit{
			models.SecondaryUnit{Name: "person years", ConversionFactor: 7.0 / 365.0},
		},
		NotesURL:               "https://github.com/google/peoplemath",
		MaxCommittedPercentage: 50,
		Buckets:                buckets,
		People:                 people,
	}
}

func makeRandomString(length int) string {
	const letters = "abcdefghijklmnopqrstuvwxyz"
	b := make([]byte, length)
	for i := 0; i < length; i++ {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}
