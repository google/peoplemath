// Copyright 2020-2021 Google LLC
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

package models

import (
	"strings"
	"time"
)

type GeneralPermissions struct {
	ReadTeamList Permission `json:"readTeamList"` // Whether a user can view the complete list of teams
	AddTeam      Permission `json:"addTeam"`      // Whether a user can add a completely new team
}

// Team model struct
type Team struct {
	ID          string          `json:"id"`
	DisplayName string          `json:"displayName"`
	Permissions TeamPermissions `json:"teamPermissions"`
}

type TeamPermissions struct {
	Read  Permission `json:"read"`  // Whether a user can view the team and all of its periods
	Write Permission `json:"write"` // Whether the user can make changes to the team, i.e. add new periods and make changes to existing ones
}

type Permission struct {
	Allow []UserMatcher `json:"allow"`
}

type UserMatcher struct {
	Type string `json:"type"`
	ID   string `json:"id"`
}

func (matcher UserMatcher) matches(user User) bool {
	return (matcher.Type == UserMatcherTypeDomain && strings.ToLower(matcher.ID) == strings.ToLower(user.Domain)) ||
		(matcher.Type == UserMatcherTypeEmail && strings.ToLower(matcher.ID) == strings.ToLower(user.Email))
}

func (user User) IsPermitted(permissions []UserMatcher) bool {
	for _, userMatcher := range permissions {
		if userMatcher.matches(user) {
			return true
		}
	}
	return false
}

const (
	UserMatcherTypeEmail  = "Email"
	UserMatcherTypeDomain = "Domain"
)

// This struct is used to pass the list of teams to the frontend,
// it adds a boolean as to whether the user has the permission to add a new team (this is just for the UI,
// as the "AddTeam" button will be disabled if this bool is false)
type TeamList struct {
	Teams      []Team `json:"teams"`
	CanAddTeam bool   `json:"canAddTeam"`
}

// Period model struct
type Period struct {
	ID                     string          `json:"id"`
	DisplayName            string          `json:"displayName"`
	Unit                   string          `json:"unit"`
	NotesURL               string          `json:"notesURL"`
	MaxCommittedPercentage float64         `json:"maxCommittedPercentage"`
	Buckets                []Bucket        `json:"buckets"`
	People                 []Person        `json:"people"`
	SecondaryUnits         []SecondaryUnit `json:"secondaryUnits"`
	// UUID for simple optimistic concurrency control
	LastUpdateUUID string `json:"lastUpdateUUID"`
}

// Bucket model struct
type Bucket struct {
	DisplayName          string      `json:"displayName"`
	AllocationPercentage float64     `json:"allocationPercentage"`
	Objectives           []Objective `json:"objectives"`
}

type DisplayOptions struct {
	EnableMarkdown bool `json:"enableMarkdown"`
}

// Objective model struct
type Objective struct {
	Name             string           `json:"name"`
	ResourceEstimate float64          `json:"resourceEstimate"`
	Assignments      []Assignment     `json:"assignments"`
	CommitmentType   string           `json:"commitmentType"`
	Notes            string           `json:"notes"`
	Groups           []ObjectiveGroup `json:"groups"`
	Tags             []ObjectiveTag   `json:"tags"`
	DisplayOptions   DisplayOptions   `json:"displayOptions"`
	BlockID          string           `json:"blockID"`
}

// ObjectiveGroup model struct
type ObjectiveGroup struct {
	GroupType string `json:"groupType"`
	GroupName string `json:"groupName"`
}

// ObjectiveTag model struct
type ObjectiveTag struct {
	Name string `json:"name"`
}

// SecondaryUnit model struct
type SecondaryUnit struct {
	Name             string  `json:"name"`
	ConversionFactor float64 `json:"conversionFactor"`
}

// Valid commitment types for assignments
const (
	CommitmentTypeAspirational = "Aspirational"
	CommitmentTypeCommitted    = "Committed"
)

// Assignment model struct
type Assignment struct {
	PersonID   string  `json:"personId"`
	Commitment float64 `json:"commitment"`
}

// Person model struct
type Person struct {
	ID           string  `json:"id"`
	DisplayName  string  `json:"displayName"`
	Location     string  `json:"location"`
	Availability float64 `json:"availability"`
}

// ObjectUpdateResponse is returned to the browser after an insert or update (e.g. for concurrency control)
type ObjectUpdateResponse struct {
	LastUpdateUUID string `json:"lastUpdateUUID"`
}

// Settings holds stored configuration options
type Settings struct {
	ImproveURL         string `datastore:"ImproveUrl"` // Field name overridden for backwards compatibility
	GeneralPermissions GeneralPermissions
}

type User struct {
	Email  string
	Domain string
}

type PeriodBackup struct {
	Timestamp time.Time `json:"timestamp"`
	Period    Period    `json:"period"`
}

type PeriodBackups struct {
	Backups []PeriodBackup `json:"backups"`
}
