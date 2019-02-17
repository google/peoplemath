// Copyright 2019 Google LLC
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

package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func addTeam(handler http.Handler, teamID string, t *testing.T) {
	team := Team{ID: teamID, DisplayName: teamID}
	b := new(bytes.Buffer)
	enc := json.NewEncoder(b)
	err := enc.Encode(team)
	if err != nil {
		t.Fatalf("Could not serialize team: %v", err)
	}
	req := httptest.NewRequest(http.MethodPost, "/api/team/", b)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)
	resp := w.Result()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected response %v, got %v", http.StatusOK, resp.StatusCode)
	}
}

func addPeriod(handler http.Handler, teamID, periodJSON string, t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/api/period/"+teamID+"/", strings.NewReader(periodJSON))
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)
	resp := w.Result()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected response %v, got %v", http.StatusOK, resp.StatusCode)
	}
}

func TestPostPeriod(t *testing.T) {
	server := Server{store: makeInMemStore()}
	handler := server.makeHandler()

	teamID := "myteam"
	addTeam(handler, teamID, t)
	periodJSON := `{"id":"2019q1","displayName":"2019Q1","unit":"person weeks","buckets":[{"displayName":"Bucket one","allocationPercentage":80,"objectives":[{"name":"Objective 1","resourceEstimate":0,"assignments":[]}]}],"people":[]}`
	addPeriod(handler, teamID, periodJSON, t)

	req := httptest.NewRequest(http.MethodGet, "/api/period/"+teamID+"/2019q1", nil)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)
	resp := w.Result()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected response %v, got %v", http.StatusOK, resp.StatusCode)
	}
	p := Period{}
	dec := json.NewDecoder(resp.Body)
	err := dec.Decode(&p)
	if err != nil {
		t.Fatalf("Could not decode response body: %v", err)
	}
	if p.Buckets[0].AllocationPercentage != 80 {
		t.Fatalf("Expected allocation percentage 80, found %v", p.Buckets[0].AllocationPercentage)
	}
}
