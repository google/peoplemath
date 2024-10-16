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
	"peoplemath/models"
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/google/go-cmp/cmp/cmpopts"
)

const (
	pid = "test-pid"
)

func TestStringMerge(t *testing.T) {
	var merger PeriodMerger
	base := models.Period2{ID: pid, DisplayName: "My period", Version: "v1"}
	renamed := models.Period2{ID: pid, DisplayName: "My renamed period", Version: "v2"}
	identicalRename := models.Period2{ID: pid, DisplayName: "My renamed period", Version: "v3"}
	unrelatedChange := models.Period2{ID: pid, DisplayName: base.DisplayName, NotesURL: "foo", Version: "v4"}
	conflictingChange := models.Period2{ID: pid, DisplayName: "My conflictingly renmaed period", Version: "v5"}

	for i, tc := range []struct {
		latest, incoming *models.Period2
		expectSuccess    bool
		expectedDN       string
		expectedParents  []string
		expectedNotesURL string
	}{
		// Trivial merge
		{latest: &base, incoming: &base, expectSuccess: true, expectedDN: "My period", expectedParents: []string{"v1"}},
		// No concurrent change
		{latest: &base, incoming: &renamed, expectSuccess: true, expectedDN: "My renamed period", expectedParents: []string{"v1"}},
		// Concurrent change but no change on the incoming side
		{latest: &renamed, incoming: &unrelatedChange, expectSuccess: true, expectedDN: "My renamed period", expectedParents: []string{"v1", "v2"}, expectedNotesURL: "foo"},
		// Identical rename on both sides
		{latest: &identicalRename, incoming: &renamed, expectSuccess: true, expectedDN: "My renamed period", expectedParents: []string{"v1", "v3"}},
		// Concurrent change to unrelated field
		{latest: &unrelatedChange, incoming: &renamed, expectSuccess: true, expectedDN: "My renamed period", expectedParents: []string{"v1", "v4"}, expectedNotesURL: "foo"},
		// Conflicting rename
		{latest: &conflictingChange, incoming: &renamed, expectSuccess: false},
	} {
		expectedID := tc.incoming.ID
		merged := merger.MergePeriods(&base, tc.latest, tc.incoming)
		if merger.MergeSuccessful() != tc.expectSuccess {
			t.Errorf("Case %d: expected MergeSuccessful=%v, found=%v (errors: %v)",
				i, tc.expectSuccess, merger.MergeSuccessful(), merger.ErrorSummary())
		}
		if !tc.expectSuccess {
			continue
		}
		if merged.ID != expectedID {
			t.Errorf("Case %d: expected ID=%s, found %s", i, expectedID, merged.ID)
		}
		if merged.DisplayName != tc.expectedDN {
			t.Errorf("Case %d: expected DisplayName=%s, found %s", i, tc.expectedDN, merged.DisplayName)
		}
		if diff := cmp.Diff(tc.expectedParents, merged.ParentVersions, cmpopts.SortSlices(func(a, b string) bool { return a < b })); diff != "" {
			t.Errorf("Case %d: unexpected ParentVersions (-want +got):\n%s", i, diff)
		}
		if merged.NotesURL != tc.expectedNotesURL {
			t.Errorf("Case %d: expected NotesURL=%s, found %s", i, tc.expectedNotesURL, merged.NotesURL)
		}
	}
}

func TestMismatchingIDs(t *testing.T) {
	var merger PeriodMerger
	base := models.Period2{ID: pid, DisplayName: "My period", Version: "v1"}
	incoming := models.Period2{ID: "different", DisplayName: "My period", Version: "v2"}
	merger.MergePeriods(&base, &base, &incoming)
	if merger.MergeSuccessful() {
		t.Errorf("Expected failed merge with mismatching IDs")
	}
}
