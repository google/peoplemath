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
	handler := makeHandler(makeInMemStore())

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
