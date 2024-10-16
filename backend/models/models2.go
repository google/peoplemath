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

package models

// Period2 is a new version of the Period model struct.
// It should eventually replace Period as part of https://github.com/google/peoplemath/issues/214.
type Period2 struct {
	ID                     string          `json:"id"`
	DisplayName            string          `json:"displayName"`
	Unit                   string          `json:"unit"`
	UnitAbbrev             string          `json:"unitAbbrev"`
	NotesURL               string          `json:"notesURL"`
	MaxCommittedPercentage float64         `json:"maxCommittedPercentage"`
	Buckets                []Bucket        `json:"buckets"`
	People                 []Person        `json:"people"`
	SecondaryUnits         []SecondaryUnit `json:"secondaryUnits"`
	// Version is an ID to uniquely identify this version of this period.
	Version string `json:"version"`
	// ParentVersions is the list of Version IDs of period versions from which this period was derived.
	// Versions coming from the front end should have 0 ParentVersions (for a brand new period)
	// or 1 ParentVersion (for an update). If there have been concurrent edits, the backend may respond
	// with a Period with multiple ParentVersions. In this case, the first element of ParentVersions
	// must be the latest version at the time of the update (this allows us to examine only the first
	// ParentVersion when looking for the merge base of two versions).
	ParentVersions []string `json:"parentVersion"`
}

type PeriodListItem struct {
	Name string `json:"name"`
	ID   string `json:"id"`
}

type PeriodList struct {
	Periods []PeriodListItem `json:"periods"`
}
