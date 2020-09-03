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
	firebase "firebase.google.com/go/v4"
	"log"
	"net/http"
	"strings"
	"time"
)

const (
	defaultAuthTimeout = 5 * time.Second
)

type Auth interface {
	Authenticate(ctx context.Context, token string) (userEmail string, err error)
	Authorize(next http.HandlerFunc) http.HandlerFunc
}

type NoAuth struct{}

func (auth NoAuth) Authorize(next http.HandlerFunc) http.HandlerFunc {
	return next
}

func (auth NoAuth) Authenticate(ctx context.Context, token string) (userEmail string, err error) {
	return "", nil
}

func getDomain(email string) string {
	emailParts := strings.Split(email, "@")
	return emailParts[len(emailParts)-1]
}

func GetAuthProvider(authMode, authDomain string) (authProvider Auth) {
	if authMode == "none" {
		authProvider = NoAuth{}
	} else if authMode == "firebase" {
		log.Printf("Using firebase authentication per command-line flag")
		ctx := context.Background()
		app, err := firebase.NewApp(ctx, nil)
		if err != nil {
			log.Fatalf("Could not instantiate Firebase app: %v\n", err)
			return
		}
		firebaseClient, err := app.Auth(ctx)
		if err != nil {
			log.Fatalf("Could not get Firebase Auth client: %v\n", err)
			return
		}
		firebaseAuth := FirebaseAuth{
			FirebaseClient: firebaseClient,
			AuthTimeout:    defaultAuthTimeout,
			AuthDomain:     authDomain,
		}
		authProvider = firebaseAuth
	} else {
		log.Fatalf("%s is not a supported authMode. Supported are 'none' and 'firebase'.", authMode)
	}
	return
}
