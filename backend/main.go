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
	"log"
	"net/http"
	"os"
	"peoplemath/controllers"
	"peoplemath/google_cds_store"
	"peoplemath/in_memory_storage"
	"peoplemath/server"
	"peoplemath/storage"
)

func initStorage() {
	var useInMemStore bool
	flag.BoolVar(&useInMemStore, "inmemstore", false, "Use in-memory datastore")
	flag.Parse()

	storageType := storage.GoogleCloudDatastoreType
	if useInMemStore {
		storageType = storage.InMemoryStorageType
	}

	var s storage.StorageService
	switch storageType {
	case storage.InMemoryStorageType:
		log.Printf("Using in-memory store per command-line flag")
		s = in_memory_storage.MakeInMemStore()
	case storage.GoogleCloudDatastoreType:
		gcloudProject := os.Getenv("GOOGLE_CLOUD_PROJECT")
		if gcloudProject == "" {
			log.Fatalf("GOOGLE_CLOUD_PROJECT not set")
			return
		}
		log.Printf("Using Cloud Datastore storage service; project='%s'", gcloudProject)
		log.Printf("To use the local emulator, see https://cloud.google.com/datastore/docs/tools/datastore-emulator")
		ctx := context.Background()
		var err error
		s, err = google_cds_store.MakeGoogleCDSStore(ctx, gcloudProject)
		if err != nil {
			log.Fatalf("Could not instantiate datastore: %s", err)
			return
		}
	}
	storage.SetStorage(s)
}

func initServer() *http.Server {
	handler := server.MakeHandler()
	srv := server.InitServer(handler)
	return srv
}

func main() {
	initStorage()
	controllers.InitControllers()
	srv := initServer()
	log.Fatal(srv.ListenAndServe())
}
