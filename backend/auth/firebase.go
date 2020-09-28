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
	"log"
	"net/http"
	"peoplemath/models"
	"strings"
	"time"

	"firebase.google.com/go/v4/auth"
)

// FirebaseAuth is an Auth implementation which uses Firebase for authentication.
type FirebaseAuth struct {
	FirebaseClient firebaseAuthClient
	AuthTimeout    time.Duration
}

type firebaseAuthClient interface {
	VerifyIDToken(ctx context.Context, idToken string) (*auth.Token, error)
}

func (auth *FirebaseAuth) Authenticate(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), auth.AuthTimeout)
		defer cancel()

		idToken := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
		token, err := auth.FirebaseClient.VerifyIDToken(ctx, idToken)
		if err != nil {
			w.Header().Add("Authorization", "WWW-Authenticate: Bearer")
			log.Printf("User authentication failed: %v", err)
			http.Error(w, "User authentication failed", http.StatusUnauthorized)
			return
		}
		if !token.Claims["email_verified"].(bool) {
			w.Header().Add("Authorization", "WWW-Authenticate: Bearer")
			http.Error(w, "User authentication failed, please verify your email address", http.StatusUnauthorized)
			return
		}

		userEmail := token.Claims["email"].(string)
		user := models.User{
			Email:  userEmail,
			Domain: getDomain(userEmail),
		}

		ctxWithUser := context.WithValue(r.Context(), ContextKey("user"), user)
		next(w, r.WithContext(ctxWithUser))
	}
}

// TODO(#81) The below code is likely to be the same for any Auth implementation which
// actually wants to perform permissions checks. Move it into a separate type.

func getTeamAllowedUsers(team models.Team, action string) []models.UserMatcher {
	var permissions []models.UserMatcher
	if action == ActionRead {
		permissions = team.Permissions.Read.Allow
	} else if action == ActionWrite {
		permissions = team.Permissions.Write.Allow
	} else {
		log.Fatalf("The permission action passed (%v) is not implemented.", action)
	}
	return permissions
}

func getGeneralAllowedUsers(generalPermissions models.GeneralPermissions, action string) []models.UserMatcher {
	var permissions []models.UserMatcher
	if action == ActionRead {
		permissions = generalPermissions.ReadTeamList.Allow
	} else if action == ActionWrite {
		permissions = generalPermissions.AddTeam.Allow
	} else {
		log.Fatalf("The permission action passed (%v) is not implemented.", action)
	}
	return permissions
}

func (auth *FirebaseAuth) CanActOnTeam(user models.User, team models.Team, action string) bool {
	permissions := getTeamAllowedUsers(team, action)
	return user.IsPermitted(permissions)
}

func (auth *FirebaseAuth) CanActOnTeamList(user models.User, generalPermissions models.GeneralPermissions, action string) bool {
	permissions := getGeneralAllowedUsers(generalPermissions, action)
	return user.IsPermitted(permissions)
}
