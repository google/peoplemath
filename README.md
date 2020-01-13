# PeopleMath

## Introduction

This is a web application designed to help managers plan how teams will spend their time, particularly in situations where there is an aim to split the team's resources between several independently-prioritised "buckets" of work in a certain ratio.

The fundamental entity in PeopleMath is the *period*, which can be any length of time you want to plan for your team. For each period, planners are expected to enter:

* What *objectives* are you considering working on during this period, in each bucket?
* How much (in whatever unit of resources you prefer to use) do you think each objective would require to complete?
* What is the relative priority order of the objectives, within each bucket?
* How much (of your resource units) do you expect each person on your team to have available during the period?
* How much of each person's available resources do you intend to allocate to each objective?
* Therefore, what is your level of confidence in the completion of each objective?

The tool also supports a distinction between "committed" and "aspirational" objectives:

* A *committed* objective is one which your team is making a firm promise to complete within the period; perhaps some other team or a customer is depending on it.
* An *aspirational* objective is one you would like to achieve if possible, but something you would be willing to sacrifice for a committed objective if necessary.

It's generally a good idea to keep an eye on the fraction of your team's resources allocated to committed objectives. Too little, and your team is promising too little to its stakeholders; too much, and you are at risk of breaking your promises, as there is nothing you can safely drop if you find yourself behind on a committed objective. PeopleMath allows you to set a target "commit ratio", and tells you how your plan compares to that target.

This is not an officially supported Google product.

## Implementation

The front end was built using [Angular](https://angular.io) and [Angular Material](https://material.angular.io). The API server in the `backend` directory was written in [Go](https://golang.org).

The whole application was designed to run on [Google App Engine](https://cloud.google.com/appengine/), using [Google Cloud Datastore](https://cloud.google.com/datastore/) for persistence, though the front-end could be deployed with a back-end that used an entirely different persistence mechanism or runtime platform.

## Development

The easiest way to work on the front end is to use the [Angular CLI](https://cli.angular.io/) (`ng serve`, `ng test` etc), after an `npm install` to install the dependencies.

In development mode, the CLI will [proxy](https://angular.io/guide/build#proxying-to-a-backend-server) API requests to a backend running on `localhost:8080`. To run the backend server locally, install the [Go toolchain](https://golang.org/dl/) (1.12 or later), run `go build` in the `backend` directory, and run the resulting `peoplemath` binary.

The simplest way to run it is with `peoplemath --inmemstore`, which will use a simple in-memory implementation of the API. This has no external dependencies, but data written will not survive a restart of the API server.

To persist the API data and exercise the Cloud Datastore persistence layer, the [Cloud Datastore emulator](https://cloud.google.com/datastore/docs/tools/datastore-emulator) can be used: install and start the emulator, then set the environment variables according to the instructions, set the `GOOGLE_CLOUD_PROJECT` environment variable, and run `peoplemath` with no arguments.

## Deployment to App Engine

To deploy the app to Google App Engine:

* Create a Google Cloud project as described in [the quickstart guide](https://cloud.google.com/appengine/docs/standard/go112/quickstart)
* Run `gcloud config set project [YOUR_PROJECT_ID]`
* Run `build_appengine.sh` or equivalent commands to build the front-end and generate the `appengine_dist` directory
* `cd appengine_dist` and `gcloud app deploy`
