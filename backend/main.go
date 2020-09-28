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
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	firebase "firebase.google.com/go/v4"

	"peoplemath/auth"
	"peoplemath/controllers"
	"peoplemath/google_cds_store"
	"peoplemath/in_memory_storage"
	"peoplemath/storage"
)

const (
	defaultStoreTimeout = 5 * time.Second
	defaultAuthTimeout  = 5 * time.Second
)

func main() {
	var useInMemStore bool
	var authMode string
	var defaultDomain string
	flag.BoolVar(&useInMemStore, "inmemstore", false, "Use in-memory datastore")
	flag.StringVar(&defaultDomain, "defaultdomain", "google.com", "When using inmemstore: the domain that all team permissions are defaulted to")
	flag.StringVar(&authMode, "authmode", "none", "Set authentication mode, either 'none' or 'firebase'")
	flag.Parse()

	var store storage.StorageService
	if useInMemStore {
		log.Printf("Using in-memory store per command-line flag")
		store = in_memory_storage.MakeInMemStore(defaultDomain)
	} else {
		gcloudProject := os.Getenv("GOOGLE_CLOUD_PROJECT")
		if gcloudProject == "" {
			log.Fatalf("GOOGLE_CLOUD_PROJECT not set")
			return
		}
		log.Printf("Using Cloud Datastore storage service; project='%s'", gcloudProject)
		log.Printf("To use the local emulator, see https://cloud.google.com/datastore/docs/tools/datastore-emulator")
		ctx := context.Background()
		var err error
		store, err = google_cds_store.MakeGoogleCDSStore(ctx, gcloudProject)
		if err != nil {
			log.Fatalf("Could not instantiate datastore: %s", err)
			return
		}
	}

	var authProvider auth.Auth

	if authMode == "none" {
		authProvider = auth.NoAuth{}
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
		firebaseAuth := &auth.FirebaseAuth{
			FirebaseClient: firebaseClient,
			AuthTimeout:    defaultAuthTimeout,
		}
		authProvider = firebaseAuth
	} else {
		log.Fatalf("%s is not a supported authMode. Supported are 'none' and 'firebase'.", authMode)
	}

	server := controllers.MakeServer(store, defaultStoreTimeout, authProvider)

	handler := server.MakeHandler()
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
		log.Printf("Defaulting to port %s", port)
	}
	log.Printf("Listening on port %s", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), handler))
}
