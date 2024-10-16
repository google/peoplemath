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

package merge

import (
	"fmt"
	"peoplemath/models"
	"reflect"
	"strings"

	"github.com/google/uuid"
)

// PeriodMerger is a type responsible for performing a three-way merge of periods.
type PeriodMerger struct {
	errors []string
}

func (m *PeriodMerger) requireIdenticalStrings(path, base, latest, incoming string) string {
	if base != latest || base != incoming {
		m.addError(path, fmt.Sprintf("identical strings required: base=%s, latest=%s, incoming=%s", base, latest, incoming))
	}
	return incoming
}

func (m *PeriodMerger) mergeStrings(path, base, latest, incoming string) string {
	if base == latest || latest == incoming {
		// No concurrent change, or identical changes made on both sides
		return incoming
	}
	if base == incoming {
		// Concurrent change, but no change on the incoming side
		return latest
	}
	// Conflicting changes
	m.addError(path, fmt.Sprintf("conflicting updates: base=%s, latest=%s, incoming=%s", base, latest, incoming))
	return incoming
}

func (m *PeriodMerger) mergeFloat64s(path string, base, latest, incoming float64) float64 {
	if base == latest || latest == incoming {
		// No concurrent change, or identical changes made on both sides
		return incoming
	}
	if base == incoming {
		// Concurrent change, but no change on the incoming side
		return latest
	}
	// Conflicting changes
	m.addError(path, fmt.Sprintf("conflicting updates: base=%v, latest=%v, incoming=%v", base, latest, incoming))
	return incoming
}

func (m *PeriodMerger) mergeSecondaryUnits(base, latest, incoming []models.SecondaryUnit) []models.SecondaryUnit {
	// Secondary units are rarely changed. Don't allow concurrent updates.
	if reflect.DeepEqual(base, latest) || reflect.DeepEqual(latest, incoming) {
		// No concurrent change, or identical changes made on both sides
		return incoming
	}
	if reflect.DeepEqual(base, incoming) {
		// Concurrent change, but no change on the incoming side
		return latest
	}
	// Conflicting changes
	m.addError("SecondaryUnits", "conflicting updates")
	return incoming
}

func (m *PeriodMerger) mergeBuckets(base, latest, incoming []models.Bucket) []models.Bucket {
	// TODO: More intelligent logic to support concurrent updates to buckets
	if reflect.DeepEqual(base, latest) || reflect.DeepEqual(latest, incoming) {
		// No concurrent change, or identical changes made on both sides
		return incoming
	}
	if reflect.DeepEqual(base, incoming) {
		// Concurrent change, but no change on the incoming side
		return latest
	}
	// Conflicting changes
	m.addError("Buckets", "conflicting updates")
	return incoming
}

func (m *PeriodMerger) mergePeople(base, latest, incoming []models.Person) []models.Person {
	// TODO: More intelligent logic to support concurrent updates to people
	if reflect.DeepEqual(base, latest) || reflect.DeepEqual(latest, incoming) {
		// No concurrent change, or identical changes made on both sides
		return incoming
	}
	if reflect.DeepEqual(base, incoming) {
		// Concurrent change, but no change on the incoming side
		return latest
	}
	// Conflicting changes
	m.addError("People", "conflicting updates")
	return incoming
}

func (m *PeriodMerger) MergePeriods(base, latest, incoming *models.Period2) *models.Period2 {
	// Simplify the common case where there has been no concurrent update
	if base.Version == latest.Version {
		m.requireIdenticalStrings("ID", base.ID, latest.ID, incoming.ID)
		result := *incoming
		result.Version = uuid.NewString()
		result.ParentVersions = []string{latest.Version}
		return &result
	}

	return &models.Period2{
		ID:                     m.requireIdenticalStrings("ID", base.ID, latest.ID, incoming.ID),
		DisplayName:            m.mergeStrings("DisplayName", base.DisplayName, latest.DisplayName, incoming.DisplayName),
		Unit:                   m.mergeStrings("Unit", base.Unit, latest.Unit, incoming.Unit),
		UnitAbbrev:             m.mergeStrings("UnitAbbrev", base.UnitAbbrev, latest.UnitAbbrev, incoming.UnitAbbrev),
		SecondaryUnits:         m.mergeSecondaryUnits(base.SecondaryUnits, latest.SecondaryUnits, incoming.SecondaryUnits),
		NotesURL:               m.mergeStrings("NotesURL", base.NotesURL, latest.NotesURL, incoming.NotesURL),
		MaxCommittedPercentage: m.mergeFloat64s("MaxCommittedPercentage", base.MaxCommittedPercentage, latest.MaxCommittedPercentage, incoming.MaxCommittedPercentage),
		Buckets:                m.mergeBuckets(base.Buckets, latest.Buckets, incoming.Buckets),
		People:                 m.mergePeople(base.People, latest.People, incoming.People),
		Version:                uuid.NewString(),
		ParentVersions:         []string{base.Version, latest.Version},
	}
}

func (m *PeriodMerger) addError(path, err string) {
	m.errors = append(m.errors, fmt.Sprintf("%s: %s", path, err))
}

func (m *PeriodMerger) MergeSuccessful() bool {
	return len(m.errors) == 0
}

func (m *PeriodMerger) ErrorSummary() string {
	return strings.Join(m.errors, "\n")
}
