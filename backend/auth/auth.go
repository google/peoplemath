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
	"net/http"
	"strings"
)

type Auth interface {
	Authenticate(token string) (userEmail string, httpError *string)
	Authorize(next http.HandlerFunc) http.HandlerFunc
}

type NoAuth struct{}

func (auth NoAuth) Authorize(next http.HandlerFunc) http.HandlerFunc {
	return next
}

func (auth NoAuth) Authenticate(token string) (userEmail string, httpError *string) {
	return "", nil
}

func getDomain(email string) string {
	emailParts := strings.Split(email, "@")
	return emailParts[len(emailParts)-1]
}
