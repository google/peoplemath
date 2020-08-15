// Copyright 2020 Google LLC
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

// Team model struct
type Team struct {
	ID          string `json:"id"`
	DisplayName string `json:"displayName"`
}

// User model for authentication and authorisation
type User struct {
	UID   string `json:"uid"`
	Email string `json:"email"`
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

// Objective model struct
type Objective struct {
	Name             string           `json:"name"`
	ResourceEstimate float64          `json:"resourceEstimate"`
	Assignments      []Assignment     `json:"assignments"`
	CommitmentType   string           `json:"commitmentType"`
	Notes            string           `json:"notes"`
	Groups           []ObjectiveGroup `json:"groups"`
	Tags             []ObjectiveTag   `json:"tags"`
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
	ImproveURL string `datastore:"ImproveUrl"` // Field name overridden for backwards compatibility
}
