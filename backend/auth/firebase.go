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
	"errors"
	"firebase.google.com/go/v4/auth"
	"net/http"
	"strings"
	"time"
)

type FirebaseAuth struct {
	FirebaseClient firebaseAuthClient
	AuthTimeout    time.Duration
	AuthDomain     string
}

type firebaseAuthClient interface {
	VerifyIDToken(ctx context.Context, idToken string) (*auth.Token, error)
}

func (auth *FirebaseAuth) Authorize(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idToken := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
		userEmail, err := auth.Authenticate(r.Context(), idToken)
		if err != nil {
			w.Header().Add("Authorization", "WWW-Authenticate: Bearer")
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}
		if getDomain(userEmail) != auth.AuthDomain {
			http.Error(w, "You are not authorized to view this resource", http.StatusForbidden)
			return
		}
		next(w, r)
	}
}

func (auth *FirebaseAuth) Authenticate(ctx context.Context, idToken string) (userEmail string, err error) {
	ctx, cancel := context.WithTimeout(ctx, auth.AuthTimeout)
	defer cancel()

	token, err := auth.FirebaseClient.VerifyIDToken(ctx, idToken)
	errorMessage := ""
	if err != nil {
		errorMessage = "User authentication failed "
		return "", errors.New(errorMessage)
	}
	if !token.Claims["email_verified"].(bool) {
		errorMessage = "User authentication failed, please verify your email address"
		return "", errors.New(errorMessage)
	}

	userEmail = token.Claims["email"].(string)
	return userEmail, nil
}
