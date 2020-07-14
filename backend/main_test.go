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

package main

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
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

func attemptWritePeriod(handler http.Handler, teamID, periodJSON, httpMethod string, t *testing.T) *http.Response {
	req := httptest.NewRequest(httpMethod, "/api/period/"+teamID+"/", strings.NewReader(periodJSON))
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)
	return w.Result()
}

func addPeriod(handler http.Handler, teamID, periodJSON string, t *testing.T) {
	resp := attemptWritePeriod(handler, teamID, periodJSON, http.MethodPost, t)
	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := ioutil.ReadAll(resp.Body)
		body := string(bodyBytes)
		t.Fatalf("Expected response %v, got %v: %v", http.StatusOK, resp.StatusCode, body)
	}
}

func getPeriod(handler http.Handler, teamID, periodID string, t *testing.T) *Period {
	req := httptest.NewRequest(http.MethodGet, "/api/period/"+teamID+"/"+periodID, nil)
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
	return &p
}

func TestPostPeriod(t *testing.T) {
	server := Server{store: makeInMemStore()}
	handler := server.makeHandler()

	teamID := "myteam"
	addTeam(handler, teamID, t)
	periodJSON := `{"id":"2019q1","displayName":"2019Q1","unit":"person weeks","notesURL":"http://test","buckets":[{"displayName":"Bucket one","allocationPercentage":80,"objectives":[{"name":"Objective 1","resourceEstimate":0,"commitmentType":"Committed","notes":"some notes","assignments":[]}]}],"people":[{"id": "alice", "displayName": "Alice Atkins", "location": "LON", "availability": 5}]}`
	addPeriod(handler, teamID, periodJSON, t)

	p := getPeriod(handler, teamID, "2019q1", t)

	if p.Buckets[0].AllocationPercentage != 80 {
		t.Fatalf("Expected allocation percentage 80, found %v", p.Buckets[0].AllocationPercentage)
	}
	readNotes := p.Buckets[0].Objectives[0].Notes
	if readNotes != "some notes" {
		t.Fatalf("Expected notes to persist, found %q", readNotes)
	}

	if p.People[0].Location != "LON" {
		t.Fatalf("Expected location to be LON, found %q", p.People[0].Location)
	}

}

func TestInvalidCommitmentType(t *testing.T) {
	server := Server{store: makeInMemStore()}
	handler := server.makeHandler()

	teamID := "myteam"
	addTeam(handler, teamID, t)
	periodJSON := `{"id":"2019q1","displayName":"2019Q1","unit":"person weeks","notesURL":"http://test","buckets":[{"displayName":"Bucket one","allocationPercentage":80,"objectives":[{"name":"Objective 1","resourceEstimate":0,"commitmentType":"wibble","assignments":[]}]}],"people":[]}`

	resp := attemptWritePeriod(handler, teamID, periodJSON, http.MethodPost, t)

	bodyBytes, _ := ioutil.ReadAll(resp.Body)
	body := string(bodyBytes)

	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected status code %v, found %v: %v", http.StatusBadRequest, resp.StatusCode, body)
	}

	if !strings.Contains(body, "wibble") {
		t.Fatalf("Expected bad commitment type to appear in body, found: %v", body)
	}
}

func TestMissingCommitmentType(t *testing.T) {
	server := Server{store: makeInMemStore()}
	handler := server.makeHandler()

	teamID := "myteam"
	addTeam(handler, teamID, t)
	periodJSON := `{"id":"2019q1","displayName":"2019Q1","unit":"person weeks","notesURL":"http://test","buckets":[{"displayName":"Bucket one","allocationPercentage":80,"objectives":[{"name":"Objective 1","resourceEstimate":0,"assignments":[]}]}],"people":[]}`
	addPeriod(handler, teamID, periodJSON, t)

	p := getPeriod(handler, teamID, "2019q1", t)

	readCommitType := p.Buckets[0].Objectives[0].CommitmentType
	if readCommitType != "" {
		t.Fatalf("Expected read objective to have empty commitment type, found %q", readCommitType)
	}
}

func TestImprove(t *testing.T) {
	server := Server{store: makeInMemStore()}
	handler := server.makeHandler()

	req := httptest.NewRequest(http.MethodGet, "/improve", nil)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)
	resp := w.Result()
	if resp.StatusCode != http.StatusFound {
		t.Fatalf("Expected response %c, got %v", http.StatusFound, resp.StatusCode)
	}
	expectedImproveURL := "https://github.com/google/peoplemath"
	location := resp.Header.Get("Location")
	if location != expectedImproveURL {
		t.Errorf("Expected redirect to %v, found %v", expectedImproveURL, location)
	}

	bodyBytes, _ := ioutil.ReadAll(resp.Body)
	body := string(bodyBytes)
	if !strings.Contains(body, expectedImproveURL) {
		t.Errorf("Expected redirect URL %v in body, found %v", expectedImproveURL, body)
	}
}
