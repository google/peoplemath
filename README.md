# PeopleMath

## Introduction

This is a web application designed to help managers plan how teams will spend their time, particularly in situations where there is an aim to split the team's resources between several independently-prioritised "buckets" of work in a certain ratio.

The fundamental entity in PeopleMath is the *period*, which can be any length of time you want to plan for your team. For each period, planners are expected to enter:

* What *objectives* are you considering working on during this period, in each bucket?
* How much (in whatever unit of resources you prefer to use) do you think each objective would require to complete?
* What is the relative priority order of the objectives, within each bucket?
* How much (of your resource units) do you expect each person on your team to have available during the period?
* How much of each person's available resources do you intend to allocate to each objective?

The tool aims to make it easy for users to see how the team is expected to spend its time, the assumptions (e.g. priority stack-ranking) that led to that decision, and what level of confidence they should have in the completion of each objective.

This is not an officially supported Google product.

## Features

### Commitment types

The tool supports a distinction between "committed" and "aspirational" objectives:

* A *committed* objective is one which your team is making a firm promise to complete within the period; perhaps some other team or a customer is depending on it.
* An *aspirational* objective is one you would like to achieve if possible, but something you would be willing to sacrifice for a committed objective if necessary.

It's generally a good idea to keep an eye on the fraction of your team's resources allocated to committed objectives. Too little, and your team is promising too little to its stakeholders; too much, and you are at risk of breaking your promises, as there is nothing you can safely drop if you find yourself behind on a committed objective. PeopleMath allows you to set a target "commit ratio", and tells you how your plan compares to that target.

### Summary view

There is a read-only "period summary" view that shows which objectives are committed, aspirational and rejected in each bucket. This is useful for sharing with stakeholders, as it will always stay up-to-date with your plan.

### Grouping and tagging

Sometimes it is helpful to work at a less granular level than individual objectives.

For example, when working with more senior stakeholders to prioritise work, it may be helpful to group objectives together, for example by project, so users can easily see how a team's resources are being split between projects, and discuss priorities at a higher level.

For this use case, PeopleMath supports arbitrary grouping for objectives. Each objective can be marked with a set of key-value pairs, e.g. `project:X, program:Y`. For each key, you will then get a breakdown of objectives by the values, both on the right-hand side of the main period view and in the "period summary" view. The latter allows the individual objectives to be toggled on and off, and also allows you to toggle between a stack-ranked per-bucket view and an aggregate view across all buckets (in descending order of resources allocated, since objectives from different buckets cannot be compared in priority by definition).

It is also useful to be able to mark objectives with particular themes. For this, PeopleMath supports tagging: each objective can be marked with a list of tags, e.g. `KeepTheLightsOn, TechDebtReduction`. For each tag, you get a breakdown of the objectives marked with that tag.

Groups are a mutually-exclusive concept: for a single grouping key, each objective is a member of at most one group. Tags, by contrast, have a free many-to-many relationship with objectives.

## Implementation

The front end was built using [Angular](https://angular.io) and [Angular Material](https://material.angular.io). The API server in the `backend` directory was written in [Go](https://golang.org).

The whole application was designed to run on [Google App Engine](https://cloud.google.com/appengine/), using [Google Cloud Datastore](https://cloud.google.com/datastore/) for persistence, though the front-end could be deployed with a back-end that used an entirely different persistence mechanism or runtime platform.

## Development

The easiest way to work on the front end is to use the [Angular CLI](https://cli.angular.io/) (`ng serve`, `ng test` etc), after an `npm install` to install the dependencies.

In development mode, the CLI will [proxy](https://angular.io/guide/build#proxying-to-a-backend-server) API requests to a backend running on `localhost:8080`. To run the backend server locally, install the [Go toolchain](https://golang.org/dl/) (1.12 or later), run `go build` in the `backend` directory, and run the resulting `peoplemath` binary. (You can do `go run .` in the `backend` directory as a shortcut to compile and run the backend in a single command.)

The simplest way to run it is with `peoplemath --inmemstore`, which will use a simple in-memory implementation of the API. This has no external dependencies, but data written will not survive a restart of the API server.

To persist the API data and exercise the Cloud Datastore persistence layer, the [Cloud Datastore emulator](https://cloud.google.com/datastore/docs/tools/datastore-emulator) can be used: install and start the emulator, then set the environment variables according to the instructions, set the `GOOGLE_CLOUD_PROJECT` environment variable, and run `peoplemath` with no arguments.

The front-end tests can be run via `ng test`, and the back-end tests via `go test` in the `backend` directory.

### Using Docker

An alternative way of running PeopleMath using [Docker Compose](https://docs.docker.com/compose/) has been contributed by GitHub user [vavilen84](https://github.com/vavilen84) (thank you!). This will benefit developers who like to use Docker tooling. This is community-supported and not actively maintained by anyone at Google.

Configuration for this lives in the `docker` folder. Currently, there is no configuration here suitable for production use, as the frontend container uses the Angular CLI, which is not designed to be a production-quality web server.

In order to use this workflow for development, you must first [install Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/).

Then, you can run PeopleMath by `cd`ing into the project's `docker/dev` folder and running `docker-compose up`. You should then be able to access PeopleMath on `localhost:4200`.

To stop the project, run `docker-compose down`.

## Deployment to App Engine

The primary supported way of running PeopleMath in a staging or production configuration is on [Google App Engine](https://cloud.google.com/appengine/). To deploy the app to App Engine:

* Create a Google Cloud project as described in [the quickstart guide](https://cloud.google.com/appengine/docs/standard/go/quickstart)
* Run `gcloud config set project [YOUR_PROJECT_ID]`
* Run `build_appengine.sh` or equivalent commands to build the front-end and generate the `appengine_dist` directory
* `cd appengine_dist` and `gcloud app deploy`

### Authentication

To enable authentication using Firebase:
Currently, only the frontend is implemented. As long as	
`requireAuth` is set to `false` in `src/environments/environment.prod.ts` the app will run as expected without authentication.	* Set `requireAuth` to `true` in `src/environments/environment.prod.ts`
* Run backend with authmode flag `--authmode firebase`
* Download your [Firebase config file](https://support.google.com/firebase/answer/7015592#web) and copy the text into the `firebaseConfig.ts` file in the same folder.
* Download your [Firebase credentials](https://firebase.google.com/docs/admin/setup#initialize-sdk) and export them via `export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/credentials.json"`

This will allow users to be authenticated using Google Sign-in.
