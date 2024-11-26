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
	"strings"
	"testing"
)

const periodID = "p1"

type testLookup map[string]models.Period2

func (l testLookup) GetPeriodVersion(version string) (*models.Period2, bool) {
	res, ok := l[version]
	return &res, ok
}

func TestSamePeriod(t *testing.T) {
	m := make(map[string]models.Period2)
	m["v1"] = models.Period2{ID: periodID, Version: "v1"}
	period, err := MergeBaseVersion(testLookup(m), "v1", "v1")
	if err != nil {
		t.Errorf("error getting base version: %v", err)
	}
	if period.Version != "v1" {
		t.Errorf("expected merge base v1, found %s", period.Version)
	}
}

func TestImmediateParent(t *testing.T) {
	m := make(map[string]models.Period2)
	m["v1"] = models.Period2{ID: periodID, Version: "v1"}
	m["v2"] = models.Period2{ID: periodID, Version: "v2", ParentVersions: []string{"v1"}}

	period, err := MergeBaseVersion(testLookup(m), "v1", "v2")
	if err != nil {
		t.Errorf("error getting base version: %v", err)
	}
	if period.Version != "v1" {
		t.Errorf("expected merge base v1, found %s", period.Version)
	}

	period, err = MergeBaseVersion(testLookup(m), "v2", "v1")
	if err != nil {
		t.Errorf("error getting base version: %v", err)
	}
	if period.Version != "v1" {
		t.Errorf("expected merge base v1, found %s", period.Version)
	}
}

func TestImmediateSiblings(t *testing.T) {
	m := make(map[string]models.Period2)
	m["v1"] = models.Period2{ID: periodID, Version: "v1"}
	m["v2"] = models.Period2{ID: periodID, Version: "v2", ParentVersions: []string{"v1"}}
	m["v3"] = models.Period2{ID: periodID, Version: "v3", ParentVersions: []string{"v1"}}

	period, err := MergeBaseVersion(testLookup(m), "v2", "v3")
	if err != nil {
		t.Errorf("error getting base version: %v", err)
	}
	if period.Version != "v1" {
		t.Errorf("expected merge base v1, found %s", period.Version)
	}

	period, err = MergeBaseVersion(testLookup(m), "v3", "v2")
	if err != nil {
		t.Errorf("error getting base version: %v", err)
	}
	if period.Version != "v1" {
		t.Errorf("expected merge base v1, found %s", period.Version)
	}
}

func TestDeeperHierarchy(t *testing.T) {
	m := make(map[string]models.Period2)
	m["v1"] = models.Period2{ID: periodID, Version: "v1"}
	m["v2"] = models.Period2{ID: periodID, Version: "v2", ParentVersions: []string{"v1"}}
	m["v3"] = models.Period2{ID: periodID, Version: "v3", ParentVersions: []string{"v2"}}
	m["v4"] = models.Period2{ID: periodID, Version: "v4", ParentVersions: []string{"v3", "v2"}}
	m["v5"] = models.Period2{ID: periodID, Version: "v5", ParentVersions: []string{"v4"}}
	m["v6"] = models.Period2{ID: periodID, Version: "v6", ParentVersions: []string{"v2"}}
	m["v7"] = models.Period2{ID: periodID, Version: "v7", ParentVersions: []string{"v6"}}

	period, err := MergeBaseVersion(testLookup(m), "v5", "v7")
	if err != nil {
		t.Errorf("error getting base version: %v", err)
	}
	if period.Version != "v2" {
		t.Errorf("expected merge base v2, found %s", period.Version)
	}

	period, err = MergeBaseVersion(testLookup(m), "v7", "v5")
	if err != nil {
		t.Errorf("error getting base version: %v", err)
	}
	if period.Version != "v2" {
		t.Errorf("expected merge base v2, found %s", period.Version)
	}
}

func TestMissingVersion(t *testing.T) {
	m := make(map[string]models.Period2)
	m["v1"] = models.Period2{ID: periodID, Version: "v1", ParentVersions: []string{"doesnotexist"}}
	m["v2"] = models.Period2{ID: periodID, Version: "v2", ParentVersions: []string{"doesnotexist"}}

	_, err := MergeBaseVersion(testLookup(m), "v1", "v2")
	if err == nil {
		t.Errorf("expected error")
	}
	if !strings.Contains(err.Error(), "doesnotexist") {
		t.Errorf("unexpected error message: %v", err)
	}

	_, err = MergeBaseVersion(testLookup(m), "v2", "v1")
	if err == nil {
		t.Errorf("expected error")
	}
	if !strings.Contains(err.Error(), "doesnotexist") {
		t.Errorf("unexpected error message: %v", err)
	}
}

func TestLoop(t *testing.T) {
	m := make(map[string]models.Period2)
	m["v1"] = models.Period2{ID: periodID, Version: "v1", ParentVersions: []string{"v2"}}
	m["v2"] = models.Period2{ID: periodID, Version: "v2", ParentVersions: []string{"v1"}}
	m["v3"] = models.Period2{ID: periodID, Version: "v3"}

	_, err := MergeBaseVersion(testLookup(m), "v1", "v3")
	if err == nil {
		t.Errorf("expected error")
	}
	if !strings.Contains(err.Error(), "version is its own ancestor") {
		t.Errorf("unexpected error message: %v", err)
	}

	_, err = MergeBaseVersion(testLookup(m), "v3", "v1")
	if err == nil {
		t.Errorf("expected error")
	}
	if !strings.Contains(err.Error(), "version is its own ancestor") {
		t.Errorf("unexpected error message: %v", err)
	}
}

func TestNoCommonAncestor(t *testing.T) {
	m := make(map[string]models.Period2)
	m["v1"] = models.Period2{ID: periodID, Version: "v1"}
	m["v2"] = models.Period2{ID: periodID, Version: "v2", ParentVersions: []string{"v1"}}
	m["v3"] = models.Period2{ID: periodID, Version: "v3"}
	m["v4"] = models.Period2{ID: periodID, Version: "v4", ParentVersions: []string{"v3"}}

	_, err := MergeBaseVersion(testLookup(m), "v2", "v4")
	if err == nil {
		t.Errorf("expected error")
	}
	if !strings.Contains(err.Error(), "terminated search") {
		t.Errorf("unexpected error message: %v", err)
	}

	_, err = MergeBaseVersion(testLookup(m), "v4", "v2")
	if err == nil {
		t.Errorf("expected error")
	}
	if !strings.Contains(err.Error(), "terminated search") {
		t.Errorf("unexpected error message: %v", err)
	}
}
