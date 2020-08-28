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

package auth

import (
	"context"
	"firebase.google.com/go/v4/auth"
	"github.com/gorilla/mux"
	"net/http"
	"peoplemath/models"
	"peoplemath/storage"
	"strings"
	"time"
)

type FirebaseAuth struct {
	FirebaseClient firebaseAuthClient
	AuthTimeout    time.Duration
	Store          *storage.StorageService
}

type firebaseAuthClient interface {
	VerifyIDToken(ctx context.Context, idToken string) (*auth.Token, error)
}

const (
	AccessLevelRead  = "read"
	AccessLevelWrite = "write"
	AccessLevelAny   = "any"
)

func getAccessType(r *http.Request) string {
	accessTypes := map[string]string{
		http.MethodGet:  AccessLevelRead,
		http.MethodPut:  AccessLevelWrite,
		http.MethodPost: AccessLevelWrite,
	}
	return accessTypes[r.Method]
}

func getPermissionsList(team models.Team, accessType string) []models.Principal {
	var permissions []models.Principal
	if accessType == AccessLevelRead {
		permissions = team.Permissions.Read.Allow
	} else if accessType == AccessLevelWrite {
		permissions = team.Permissions.Write.Allow
	} else if accessType == AccessLevelAny {
		permissions = append(team.Permissions.Read.Allow, team.Permissions.Write.Allow...)
	}
	return permissions
}

type user struct {
	email  string
	domain string
}

func (user user) hasAccess(permission models.Principal) bool {
	return (permission.Type == models.PrincipalTypeDomain && permission.ID == user.domain) ||
		(permission.Type == models.PrincipalTypeEmail && permission.ID == user.email)
}

func (auth FirebaseAuth) Authorize(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), auth.AuthTimeout)
		defer cancel()

		// Do authentication
		idToken := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
		userEmail, httpError := auth.Authenticate(idToken)
		if httpError != nil {
			w.Header().Add("Authorization", "WWW-Authenticate: Bearer")
			http.Error(w, *httpError, http.StatusUnauthorized)
			return
		}

		// Get information that authorization is based on:
		// The user, what the user is trying to access and how
		user := user{
			email:  userEmail,
			domain: getDomain(userEmail),
		}
		teamID := mux.Vars(r)["teamID"]
		accessType := getAccessType(r)

		if teamID == "" { // If all teams are being read or a new team is being added
			accessType = AccessLevelAny // allow anyone who has any access to any team to see all teams and create new teams
			teams, err := (*auth.Store).GetAllTeams(ctx)
			if err != nil {
				http.Error(w, "Authorization failed because of internal server error", http.StatusInternalServerError)
				return
			}
			hasAccess := false
			for _, team := range teams {
				for _, permission := range getPermissionsList(team, accessType) {
					if user.hasAccess(permission) {
						hasAccess = true
					}
				}
				if !hasAccess {
					http.Error(w, "You do not have the correct permissions for this action", http.StatusForbidden)
					return
				}
			}
		} else { // If one team is being accessed
			team, found, err := (*auth.Store).GetTeam(ctx, teamID)
			if err != nil {
				http.Error(w, "Authorization failed because of internal server error", http.StatusInternalServerError)
				return
			}
			if !found {
				http.NotFound(w, r)
				return
			}

			permissions := getPermissionsList(team, accessType)
			hasAccess := false
			for _, permission := range permissions {
				if user.hasAccess(permission) {
					hasAccess = true
				}
			}
			if !hasAccess {
				http.Error(w, "You do not have the correct permissions for this action", http.StatusForbidden)
				return
			}
		}

		next(w, r)
	}
}

func (auth FirebaseAuth) Authenticate(idToken string) (userEmail string, httpError *string) {
	token, err := auth.FirebaseClient.VerifyIDToken(context.Background(), idToken)
	errorMessage := ""
	if err != nil {
		errorMessage = "User authentication failed"
		return "", &errorMessage
	}
	if !token.Claims["email_verified"].(bool) {
		errorMessage = "User authentication failed, please verify your email address"
		return "", &errorMessage
	}

	userEmail = token.Claims["email"].(string)
	return userEmail, nil
}
