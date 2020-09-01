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
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"peoplemath/auth"
	"peoplemath/in_memory_storage"
	"peoplemath/models"
	"strings"
	"testing"

	firebaseAuth "firebase.google.com/go/v4/auth"
)

func makeHandler() http.Handler {
	server := Server{store: in_memory_storage.MakeInMemStore(), auth: auth.NoAuth{}}
	return server.makeHandler()
}

func makeHTTPRequest(request *http.Request, handler http.Handler, t *testing.T) *http.Response {
	t.Logf("Making HTTP request %v %v", request.Method, request.URL)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, request)
	return w.Result()
}

func checkResponseStatus(expected int, resp *http.Response, t *testing.T) {
	if resp.StatusCode != expected {
		bodyBytes, _ := ioutil.ReadAll(resp.Body)
		body := string(bodyBytes)
		t.Fatalf("Expected response %v, got %v: %v", expected, resp.StatusCode, body)
	}
}

func checkGoodJSONResponse(resp *http.Response, t *testing.T) {
	checkResponseStatus(http.StatusOK, resp, t)
	contentType := resp.Header.Get("Content-Type")
	if contentType != "application/json" {
		t.Fatalf("Expected response Content-Type application/json, found %s", contentType)
	}
}

func attemptAddTeam(handler http.Handler, teamID string, t *testing.T) *http.Response {
	team := models.Team{ID: teamID, DisplayName: teamID}
	b := new(bytes.Buffer)
	enc := json.NewEncoder(b)
	err := enc.Encode(team)
	if err != nil {
		t.Fatalf("Could not serialize team: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/api/team/", b)
	return makeHTTPRequest(req, handler, t)
}

func addTeam(handler http.Handler, teamID string, t *testing.T) {
	resp := attemptAddTeam(handler, teamID, t)
	checkResponseStatus(http.StatusOK, resp, t)
}

func periodToJSON(period *models.Period) string {
	var b strings.Builder
	enc := json.NewEncoder(&b)
	err := enc.Encode(&period)
	if err != nil {
		panic(fmt.Sprintf("Unexpected JSON encoding error: %v", err))
	}
	return b.String()
}

func attemptWritePeriod(handler http.Handler, teamID, periodID, periodJSON, httpMethod string, t *testing.T) *http.Response {
	url := "/api/period/" + teamID + "/"
	if httpMethod == http.MethodPut {
		url += periodID
	}
	req := httptest.NewRequest(httpMethod, url, strings.NewReader(periodJSON))
	return makeHTTPRequest(req, handler, t)
}

func addPeriod(handler http.Handler, teamID, periodID, periodJSON string, t *testing.T) {
	resp := attemptWritePeriod(handler, teamID, periodID, periodJSON, http.MethodPost, t)
	checkGoodJSONResponse(resp, t)
}

func getPeriod(handler http.Handler, teamID, periodID string, t *testing.T) *models.Period {
	req := httptest.NewRequest(http.MethodGet, "/api/period/"+teamID+"/"+periodID, nil)
	resp := makeHTTPRequest(req, handler, t)

	checkGoodJSONResponse(resp, t)
	p := models.Period{}
	dec := json.NewDecoder(resp.Body)
	err := dec.Decode(&p)
	if err != nil {
		t.Fatalf("Could not decode response body: %v", err)
	}
	return &p
}

func getTeam(handler http.Handler, teamID string, t *testing.T) *models.Team {
	req := httptest.NewRequest(http.MethodGet, "/api/team/"+teamID, nil)
	resp := makeHTTPRequest(req, handler, t)

	checkGoodJSONResponse(resp, t)
	team := models.Team{}
	dec := json.NewDecoder(resp.Body)
	err := dec.Decode(&team)
	if err != nil {
		t.Fatalf("Could not decode response: %v", err)
	}

	return &team
}

func TestGetTeams(t *testing.T) {
	handler := makeHandler()

	teamID := "myteam"
	addTeam(handler, teamID, t)

	req := httptest.NewRequest(http.MethodGet, "/api/team/", nil)
	resp := makeHTTPRequest(req, handler, t)
	checkGoodJSONResponse(resp, t)

	teams := []models.Team{}
	dec := json.NewDecoder(resp.Body)
	err := dec.Decode(&teams)
	if err != nil {
		t.Fatalf("Could not decode response: %v", err)
	}
	found := false
	for _, t := range teams {
		if t.ID == teamID {
			found = true
			break
		}
	}
	if !found {
		t.Fatalf("Added team not found in output")
	}
}

func TestPostAndGetTeam(t *testing.T) {
	handler := makeHandler()

	teamID := "myteam"
	addTeam(handler, teamID, t)

	team := getTeam(handler, teamID, t)

	if team.ID != teamID {
		t.Fatalf("Response team ID should be %v, found %v", teamID, team.ID)
	}
}

func TestPostExistingTeam(t *testing.T) {
	handler := makeHandler()

	teamID := "myteam"
	addTeam(handler, teamID, t)
	resp := attemptAddTeam(handler, teamID, t)
	checkResponseStatus(http.StatusBadRequest, resp, t)
}

func TestGetMissingTeam(t *testing.T) {
	handler := makeHandler()

	req := httptest.NewRequest(http.MethodGet, "/api/team/nonexistent", nil)
	res := makeHTTPRequest(req, handler, t)
	checkResponseStatus(http.StatusNotFound, res, t)
}

func TestPutTeam(t *testing.T) {
	handler := makeHandler()

	teamID := "myteam"
	addTeam(handler, teamID, t)

	req := httptest.NewRequest(http.MethodPut, "/api/team/myteam", strings.NewReader(`{"id":"myteam","displayName":"newName"}`))
	resp := makeHTTPRequest(req, handler, t)
	checkResponseStatus(http.StatusOK, resp, t)

	team := getTeam(handler, teamID, t)
	if team.DisplayName != "newName" {
		t.Fatalf("Expected changed display name, found %v", team.DisplayName)
	}
}

func TestPutMissingTeam(t *testing.T) {
	handler := makeHandler()

	req := httptest.NewRequest(http.MethodPut, "/api/team/nonexistent", strings.NewReader(`{"id":"nonexistent","displayName":"newName"}`))
	resp := makeHTTPRequest(req, handler, t)
	checkResponseStatus(http.StatusNotFound, resp, t)
}

func TestGetPeriods(t *testing.T) {
	handler := makeHandler()

	teamID := "myteam"
	periodID := "2019q1"
	addTeam(handler, teamID, t)
	periodJSON := `{"id":"` + periodID + `","displayName":"2019Q1","unit":"person weeks","notesURL":"http://test","buckets":[{"displayName":"Bucket one","allocationPercentage":80,"objectives":[{"name":"Objective 1","resourceEstimate":0,"commitmentType":"Committed","notes":"some notes","assignments":[]}]}],"people":[{"id": "alice", "displayName": "Alice Atkins", "location": "LON", "availability": 5}]}`
	addPeriod(handler, teamID, periodID, periodJSON, t)

	req := httptest.NewRequest(http.MethodGet, "/api/period/myteam/", nil)
	resp := makeHTTPRequest(req, handler, t)
	checkGoodJSONResponse(resp, t)

	periods := []models.Period{}
	dec := json.NewDecoder(resp.Body)
	err := dec.Decode(&periods)
	if err != nil {
		t.Fatalf("Could not decode body: %v", err)
	}

	found := false
	for _, p := range periods {
		if p.ID == periodID {
			found = true
			break
		}
	}
	if !found {
		t.Fatalf("Could not find saved period in output")
	}
}

func TestGetPeriodsForMissingTeam(t *testing.T) {
	handler := makeHandler()

	req := httptest.NewRequest(http.MethodGet, "/api/period/nonexistent/", nil)
	resp := makeHTTPRequest(req, handler, t)
	checkResponseStatus(http.StatusNotFound, resp, t)
}

func TestGetMissingPeriod(t *testing.T) {
	handler := makeHandler()

	teamID := "myteam"
	addTeam(handler, teamID, t)

	req := httptest.NewRequest(http.MethodGet, "/api/period/"+teamID+"/nonexistent", nil)
	resp := makeHTTPRequest(req, handler, t)
	checkResponseStatus(http.StatusNotFound, resp, t)
}

func TestPostPeriod(t *testing.T) {
	handler := makeHandler()

	teamID := "myteam"
	periodID := "2019q1"
	addTeam(handler, teamID, t)
	periodJSON := `{"id":"` + periodID + `","displayName":"2019Q1","unit":"person weeks","notesURL":"http://test","buckets":[{"displayName":"Bucket one","allocationPercentage":80,"objectives":[{"name":"Objective 1","resourceEstimate":0,"commitmentType":"Committed","notes":"some notes","assignments":[]}]}],"people":[{"id": "alice", "displayName": "Alice Atkins", "location": "LON", "availability": 5}]}`
	addPeriod(handler, teamID, periodID, periodJSON, t)

	p := getPeriod(handler, teamID, periodID, t)

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

func TestPostExistingPeriod(t *testing.T) {
	handler := makeHandler()

	teamID := "myteam"
	periodID := "2019q1"
	addTeam(handler, teamID, t)
	periodJSON := `{"id":"` + periodID + `","displayName":"2019Q1","unit":"person weeks","notesURL":"http://test","buckets":[{"displayName":"Bucket one","allocationPercentage":80,"objectives":[{"name":"Objective 1","resourceEstimate":0,"commitmentType":"Committed","notes":"some notes","assignments":[]}]}],"people":[{"id": "alice", "displayName": "Alice Atkins", "location": "LON", "availability": 5}]}`
	addPeriod(handler, teamID, periodID, periodJSON, t)

	resp := attemptWritePeriod(handler, teamID, periodID, periodJSON, http.MethodPost, t)
	checkResponseStatus(http.StatusBadRequest, resp, t)
}

func TestPostPeriodBadJSON(t *testing.T) {
	handler := makeHandler()

	teamID := "myteam"
	addTeam(handler, teamID, t)

	resp := attemptWritePeriod(handler, teamID, "myperiodid", "some bad json", http.MethodPost, t)
	checkResponseStatus(http.StatusBadRequest, resp, t)
}

func TestPostPeriodMissingTeam(t *testing.T) {
	handler := makeHandler()

	period := models.Period{ID: "pid", DisplayName: "some period"}
	resp := attemptWritePeriod(handler, "nonexistent", period.ID, periodToJSON(&period), http.MethodPost, t)
	checkResponseStatus(http.StatusNotFound, resp, t)
}

func TestPutPeriod(t *testing.T) {
	handler := makeHandler()

	teamID := "myteam"
	periodID := "2019q1"
	addTeam(handler, teamID, t)
	periodJSON := `{"id":"` + periodID + `","displayName":"2019Q1","unit":"person weeks","notesURL":"http://test","buckets":[{"displayName":"Bucket one","allocationPercentage":80,"objectives":[{"name":"Objective 1","resourceEstimate":0,"commitmentType":"Committed","notes":"some notes","assignments":[]}]}],"people":[{"id": "alice", "displayName": "Alice Atkins", "location": "LON", "availability": 5}]}`
	addPeriod(handler, teamID, periodID, periodJSON, t)

	period := getPeriod(handler, teamID, periodID, t)
	prevUUID := period.LastUpdateUUID
	period.DisplayName = "2019 quarter 1"
	newPeriodJSON := periodToJSON(period)

	resp := attemptWritePeriod(handler, teamID, periodID, newPeriodJSON, http.MethodPut, t)
	checkGoodJSONResponse(resp, t)

	respContent := models.ObjectUpdateResponse{}
	dec := json.NewDecoder(resp.Body)
	err := dec.Decode(&respContent)
	if err != nil {
		t.Fatalf("Could not decode put response: %v", err)
	}

	period = getPeriod(handler, teamID, "2019q1", t)
	if period.DisplayName != "2019 quarter 1" {
		t.Fatalf("Period did not have updated display name: found %v", period.DisplayName)
	}
	if period.LastUpdateUUID == prevUUID {
		t.Fatalf("Expected UUID change, found %v before and after", prevUUID)
	}
	if period.LastUpdateUUID != respContent.LastUpdateUUID {
		t.Fatalf("Expected UUID to match put response %v, found %v", respContent.LastUpdateUUID, period.LastUpdateUUID)
	}
}

func TestPutMissingPeriod(t *testing.T) {
	handler := makeHandler()

	teamID := "myteam"
	periodID := "nonexistent"
	addTeam(handler, teamID, t)
	periodJSON := `{"id":"` + periodID + `","displayName":"2019Q1","unit":"person weeks","notesURL":"http://test","buckets":[{"displayName":"Bucket one","allocationPercentage":80,"objectives":[{"name":"Objective 1","resourceEstimate":0,"commitmentType":"Committed","notes":"some notes","assignments":[]}]}],"people":[{"id": "alice", "displayName": "Alice Atkins", "location": "LON", "availability": 5}]}`

	resp := attemptWritePeriod(handler, teamID, periodID, periodJSON, http.MethodPut, t)
	checkResponseStatus(http.StatusNotFound, resp, t)
}

func TestPutPeriodMissingTeam(t *testing.T) {
	handler := makeHandler()

	period := models.Period{ID: "pid", DisplayName: "some period"}
	resp := attemptWritePeriod(handler, "nonexistent", period.ID, periodToJSON(&period), http.MethodPut, t)
	checkResponseStatus(http.StatusNotFound, resp, t)
}

func TestPeriodConcurrentMod(t *testing.T) {
	handler := makeHandler()

	teamID := "myteam"
	periodID := "2019q1"
	addTeam(handler, teamID, t)
	periodJSON := `{"id":"` + periodID + `","displayName":"2019Q1","unit":"person weeks","notesURL":"http://test","buckets":[{"displayName":"Bucket one","allocationPercentage":80,"objectives":[{"name":"Objective 1","resourceEstimate":0,"commitmentType":"Committed","notes":"some notes","assignments":[]}]}],"people":[{"id": "alice", "displayName": "Alice Atkins", "location": "LON", "availability": 5}]}`
	addPeriod(handler, teamID, periodID, periodJSON, t)

	period := getPeriod(handler, teamID, periodID, t)
	period.DisplayName = "Something else"
	period.LastUpdateUUID = "This is wrong"
	newPeriodJSON := periodToJSON(period)

	resp := attemptWritePeriod(handler, teamID, periodID, newPeriodJSON, http.MethodPut, t)
	checkResponseStatus(http.StatusConflict, resp, t)

	period = getPeriod(handler, teamID, periodID, t)
	if period.DisplayName != "2019Q1" {
		t.Fatalf("Expected unchanged display name, found %v", period.DisplayName)
	}
}

func TestInvalidCommitmentType(t *testing.T) {
	handler := makeHandler()

	teamID := "myteam"
	addTeam(handler, teamID, t)
	periodID := "2019q1"
	periodJSON := `{"id":"` + periodID + `","displayName":"2019Q1","unit":"person weeks","notesURL":"http://test","buckets":[{"displayName":"Bucket one","allocationPercentage":80,"objectives":[{"name":"Objective 1","resourceEstimate":0,"commitmentType":"wibble","assignments":[]}]}],"people":[]}`

	resp := attemptWritePeriod(handler, teamID, periodID, periodJSON, http.MethodPost, t)

	bodyBytes, _ := ioutil.ReadAll(resp.Body)
	body := string(bodyBytes)

	checkResponseStatus(http.StatusBadRequest, resp, t)

	if !strings.Contains(body, "wibble") {
		t.Fatalf("Expected bad commitment type to appear in body, found: %v", body)
	}
}

func TestMissingCommitmentType(t *testing.T) {
	handler := makeHandler()

	teamID := "myteam"
	periodID := "2019q1"
	addTeam(handler, teamID, t)
	periodJSON := `{"id":"` + periodID + `","displayName":"2019Q1","unit":"person weeks","notesURL":"http://test","buckets":[{"displayName":"Bucket one","allocationPercentage":80,"objectives":[{"name":"Objective 1","resourceEstimate":0,"assignments":[]}]}],"people":[]}`
	addPeriod(handler, teamID, periodID, periodJSON, t)

	p := getPeriod(handler, teamID, periodID, t)

	readCommitType := p.Buckets[0].Objectives[0].CommitmentType
	if readCommitType != "" {
		t.Fatalf("Expected read objective to have empty commitment type, found %q", readCommitType)
	}
}

func TestImprove(t *testing.T) {
	handler := makeHandler()

	req := httptest.NewRequest(http.MethodGet, "/improve", nil)
	resp := makeHTTPRequest(req, handler, t)
	checkResponseStatus(http.StatusFound, resp, t)
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

func TestImproveBadMethods(t *testing.T) {
	handler := makeHandler()

	putreq := httptest.NewRequest(http.MethodPut, "/improve", nil)
	putresp := makeHTTPRequest(putreq, handler, t)
	checkResponseStatus(http.StatusMethodNotAllowed, putresp, t)

	postreq := httptest.NewRequest(http.MethodPost, "/improve", nil)
	postresp := makeHTTPRequest(postreq, handler, t)
	checkResponseStatus(http.StatusMethodNotAllowed, postresp, t)
}

type failAuthenticationStub struct{}

func (auth failAuthenticationStub) Authorize(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "Authentication failed", http.StatusUnauthorized)
		return
	}
}

func (auth failAuthenticationStub) Authenticate(ctx context.Context, token string) (userEmail string, err error) {
	return "", nil
}

func TestAuthMiddleware(t *testing.T) {
	server := Server{store: in_memory_storage.MakeInMemStore(), auth: failAuthenticationStub{}}
	handler := server.makeHandler()

	assertAuthenticationFailure := func(httpMethod, target string) {
		req := httptest.NewRequest(httpMethod, target, nil)
		resp := makeHTTPRequest(req, handler, t)
		checkResponseStatus(http.StatusUnauthorized, resp, t)
	}
	teamID := "myteam"
	periodID := "2019q1"

	assertAuthenticationFailure(http.MethodGet, "/api/team/"+teamID)
	assertAuthenticationFailure(http.MethodGet, "/api/team/")
	assertAuthenticationFailure(http.MethodPost, "/api/team/")
	assertAuthenticationFailure(http.MethodPut, "/api/team/"+teamID)
	assertAuthenticationFailure(http.MethodGet, "/api/period/"+teamID+"/"+periodID)
	assertAuthenticationFailure(http.MethodGet, "/api/period/"+teamID+"/")
	assertAuthenticationFailure(http.MethodPost, "/api/period/"+teamID+"/")
	assertAuthenticationFailure(http.MethodPut, "/api/period/"+teamID+"/"+periodID)

	// "/improve" is not covered by authentication so it should not return a 401
	getreq := httptest.NewRequest(http.MethodGet, "/improve", nil)
	getresp := makeHTTPRequest(getreq, handler, t)
	checkResponseStatus(http.StatusFound, getresp, t)
}

type AuthClientStub struct {
}

func (AuthClientStub) VerifyIDToken(ctx context.Context, idToken string) (*firebaseAuth.Token, error) {
	claims := map[string]interface{}{
		"user_id":        "id123",
		"email_verified": true,
		"email":          "test@google.com",
	}
	token := &firebaseAuth.Token{
		Claims: claims,
	}
	if idToken == "pass" {
		return token, nil
	} else if idToken == "passEmailUnverified" {
		token.Claims["email_verified"] = false
		return token, nil
	} else {
		token := &firebaseAuth.Token{}
		err := errors.New("token invalid")
		return token, err
	}
}

func TestFirebaseAuth(t *testing.T) {
	authDomain := "google.com"
	testAuth := auth.FirebaseAuth{
		FirebaseClient: AuthClientStub{},
		AuthDomain:     authDomain,
	}
	server := Server{store: in_memory_storage.MakeInMemStore(), auth: &testAuth}
	handler := server.makeHandler()

	req := httptest.NewRequest(http.MethodGet, "/api/team/", nil)
	req.Header.Add("Authorization", "Bearer pass")
	resp := makeHTTPRequest(req, handler, t)
	checkResponseStatus(http.StatusOK, resp, t)

	req.Header.Set("Authorization", "Bearer passEmailUnverified")
	resp = makeHTTPRequest(req, handler, t)
	checkResponseStatus(http.StatusUnauthorized, resp, t)

	req.Header.Set("Authorization", "Bearer reject")
	resp = makeHTTPRequest(req, handler, t)
	checkResponseStatus(http.StatusUnauthorized, resp, t)

	// Testing with unauthorised user domain
	testAuth.AuthDomain = ""

	req.Header.Set("Authorization", "Bearer pass")
	resp = makeHTTPRequest(req, handler, t)
	checkResponseStatus(http.StatusForbidden, resp, t)

	req.Header.Set("Authorization", "Bearer passEmailUnverified")
	resp = makeHTTPRequest(req, handler, t)
	checkResponseStatus(http.StatusUnauthorized, resp, t)

	req.Header.Set("Authorization", "Bearer reject")
	resp = makeHTTPRequest(req, handler, t)
	checkResponseStatus(http.StatusUnauthorized, resp, t)
}
