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
	"net/http"
	"peoplemath/models"
	"strings"
)

type Auth interface {
	Authenticate(next http.HandlerFunc) http.HandlerFunc
	CanActOnTeam(user models.User, team models.Team, action string) bool
	CanActOnTeamList(user models.User, generalPermissions models.GeneralPermissions, action string) bool
}

const (
	ActionRead  = "read"
	ActionWrite = "write"
)

type NoAuth struct{}

func (auth NoAuth) Authenticate(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctxWithUser := context.WithValue(r.Context(), "user", models.User{})
		next(w, r.WithContext(ctxWithUser))
	}
}

func (auth NoAuth) CanActOnTeam(user models.User, team models.Team, action string) bool {
	return true
}
func (auth NoAuth) CanActOnTeamList(user models.User, generalPermissions models.GeneralPermissions, action string) bool {
	return true
}

func getDomain(email string) string {
	emailParts := strings.Split(email, "@")
	return emailParts[len(emailParts)-1]
}
