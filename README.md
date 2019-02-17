# PeopleMath

## Introduction

This is a web application designed to help managers plan how teams will spend their time, particularly in situations where there is an aim to split the team's resources between several independently-prioritised "buckets" of work in a certain ratio.

The front end was built using [Angular](https://angular.io) and [Angular Material](https://material.angular.io). The API server in the `backend` directory was written in [Go](https://golang.org).

The whole application was designed to run on [Google AppEngine](https://cloud.google.com/appengine/), using [Google Cloud Datastore](https://cloud.google.com/datastore/) for persistence, though the front-end could be deployed with a back-end that used an entirely different persistence mechanism or runtime platform.

This is not an officially supported Google product.

## Development

The easiest way to work on the front end is to use the [Angular CLI](https://cli.angular.io/) (`ng serve`, `ng test` etc), after an `npm install` to install the dependencies.

In development mode, the CLI will [proxy](https://angular.io/guide/build#proxying-to-a-backend-server) API requests to a backend running on `localhost:8080`. To run the backend server locally, install the [Go toolchain](https://golang.org/dl/) (1.11 or later), run `go build` in the `backend` directory, and run the resulting `peoplemath` binary.

The simplest way to run it is with `peoplemath --inmemstore`, which will use a simple in-memory implementation of the API. This has no external dependencies, but data written will not survive a restart of the API server.

To persist the API data and exercise the Cloud Datastore persistence layer, the [Cloud Datastore emulator](https://cloud.google.com/datastore/docs/tools/datastore-emulator) can be used: install and start the emulator, then set the environment variables according to the instructions, set the `GOOGLE_CLOUD_PROJECT` environment variable, and run `peoplemath` with no arguments.

## Deployment to AppEngine

To deploy the app to Google AppEngine:

* Create a Google Cloud project as described in [the quickstart guide](https://cloud.google.com/appengine/docs/standard/go111/quickstart)
* Run `gcloud config set project [YOUR_PROJECT_ID]`
* Run `build_appengine.sh` or equivalent commands to build the front-end and generate the `appengine_dist` directory
* `cd appengine_dist` and `gcloud app deploy`
