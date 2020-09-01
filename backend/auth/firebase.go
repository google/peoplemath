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
	"net/http"
	"peoplemath/models"
	"strings"
	"time"
)

type FirebaseAuth struct {
	FirebaseClient firebaseAuthClient
	AuthTimeout    time.Duration
}

type firebaseAuthClient interface {
	VerifyIDToken(ctx context.Context, idToken string) (*auth.Token, error)
}

func (auth FirebaseAuth) Authenticate(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), auth.AuthTimeout)
		defer cancel()

		idToken := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
		token, err := auth.FirebaseClient.VerifyIDToken(ctx, idToken)
		if err != nil {
			w.Header().Add("Authorization", "WWW-Authenticate: Bearer")
			http.Error(w, "User authentication failed", http.StatusUnauthorized)
			return
		}
		if !token.Claims["email_verified"].(bool) {
			w.Header().Add("Authorization", "WWW-Authenticate: Bearer")
			http.Error(w, "User authentication failed, please verify your email address", http.StatusUnauthorized)
			return
		}

		userEmail := token.Claims["email"].(string)
		user := User{
			email:  userEmail,
			domain: getDomain(userEmail),
		}

		ctxWithUser := context.WithValue(r.Context(), "user", user)
		next(w, r.WithContext(ctxWithUser))
	}
}

func getPermissionsFromTeam(team models.Team, action string) []models.Principal {
	var permissions []models.Principal
	if action == ActionRead {
		permissions = team.Permissions.Read.Allow
	} else if action == ActionWrite {
		permissions = team.Permissions.Write.Allow
	}
	return permissions
}

func getPermissionsFromGeneral(generalPermissions models.GeneralPermissions, action string) []models.Principal {
	var permissions []models.Principal
	if action == ActionReadTeamList {
		permissions = generalPermissions.ReadTeamList.Allow
	} else if action == ActionAddTeam {
		permissions = generalPermissions.AddTeam.Allow
	}
	return permissions
}

func (user User) has(permission models.Principal) bool {
	return (permission.Type == models.PrincipalTypeDomain && permission.ID == user.domain) ||
		(permission.Type == models.PrincipalTypeEmail && permission.ID == user.email)
}

func (user User) isPermitted(permissions []models.Principal) bool {
	isPermitted := false
	for _, permission := range permissions {
		if user.has(permission) {
			isPermitted = true
		}
	}
	return isPermitted
}

func (auth *FirebaseAuth) CanActOnTeam(user User, team models.Team, action string) bool {
	permissions := getPermissionsFromTeam(team, action)
	return user.isPermitted(permissions)
}

func (auth *FirebaseAuth) CanActOnTeamList(user User, generalPermissions models.GeneralPermissions, action string) bool {
	permissions := getPermissionsFromGeneral(generalPermissions, action)
	return user.isPermitted(permissions)
}
