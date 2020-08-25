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
	"log"
	"net/http"
	"strings"
)

type FirebaseAuth struct {
	FirebaseClient firebaseAuthClient
}

type firebaseAuthClient interface {
	VerifyIDToken(ctx context.Context, idToken string) (*auth.Token, error)
}

func (auth FirebaseAuth) Authenticate(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), defaultAuthTimeout)
		defer cancel()

		idToken := strings.TrimPrefix(r.Header.Get("Authentication"), "Bearer ")
		_, err := auth.FirebaseClient.VerifyIDToken(ctx, idToken)
		if err != nil {
			log.Printf("User authentication failed: error: %s", err)
			http.Error(w, "User authentication failed (see server log)", http.StatusUnauthorized)
			return
		}

		next(w, r)
	}
}
