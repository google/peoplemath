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
)

// VersionLookup abstracts retrieval of period versions (e.g. over storage types)
type VersionLookup interface {
	GetPeriodVersion(version string) (*models.Period2, bool)
}

// MergeBaseVersion works out the period version to use as the merge base:
// the nearest common ancestor of two versions.
func MergeBaseVersion(lookup VersionLookup, version1, version2 string) (*models.Period2, error) {
	if version1 == version2 {
		if result, ok := lookup.GetPeriodVersion(version1); ok {
			return result, nil
		} else {
			return nil, fmt.Errorf("version does not exist: %s", version1)
		}
	}

	lseen := make(map[string]bool)
	rseen := make(map[string]bool)
	l := version1
	r := version2
	for {
		lseen[l] = true
		rseen[r] = true
		pointersMoved := false

		if lp, ok := lookup.GetPeriodVersion(l); ok {
			if len(lp.ParentVersions) > 0 {
				// ParentVersions[0] is always the latest version at the time of the update
				l = lp.ParentVersions[0]
				if lseen[l] {
					return nil, fmt.Errorf("version is its own ancestor: %s", l)
				}
				pointersMoved = true
				if rseen[l] {
					if lp, ok := lookup.GetPeriodVersion(l); ok {
						return lp, nil
					} else {
						return nil, fmt.Errorf("version does not exist: %s", l)
					}
				}
				lseen[l] = true
			}
		}

		if rp, ok := lookup.GetPeriodVersion(r); ok {
			if len(rp.ParentVersions) > 0 {
				// ParentVersions[0] is always the latest version at the time of the update
				r = rp.ParentVersions[0]
				if rseen[r] {
					return nil, fmt.Errorf("version is its own ancestor: %s", r)
				}
				pointersMoved = true
				if lseen[r] {
					if rp, ok := lookup.GetPeriodVersion(r); ok {
						return rp, nil
					} else {
						return nil, fmt.Errorf("version does not exist: %s", r)
					}
				}
				rseen[r] = true
			}
		}

		if !pointersMoved {
			break
		}
	}
	return nil, fmt.Errorf("terminated search at %s, %s", l, r)
}
