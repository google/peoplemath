# PeopleMath

## Introduction

This is a web application designed to help managers plan how teams will spend their time, particularly in situations where there is an aim to split the team's resources between several independently-prioritised "buckets" of work in a certain ratio.

The fundamental entity in PeopleMath is the _period_, which can be any length of time you want to plan for your team. For each period, planners are expected to enter:

- What _objectives_ are you considering working on during this period, in each bucket?
- How much (in whatever unit of resources you prefer to use) do you think each objective would require to complete?
- What is the relative priority order of the objectives, within each bucket?
- How much (of your resource units) do you expect each person on your team to have available during the period?
- How much of each person's available resources do you intend to allocate to each objective?

The tool aims to make it easy for users to see how the team is expected to spend its time, the assumptions (e.g. priority stack-ranking) that led to that decision, and what level of confidence they should have in the completion of each objective.

This is not an officially supported Google product.

## Features

### Commitment types

The tool supports a distinction between "committed" and "aspirational" objectives:

- A _committed_ objective is one which your team is making a firm promise to complete within the period; perhaps some other team or a customer is depending on it.
- An _aspirational_ objective is one you would like to achieve if possible, but something you would be willing to sacrifice for a committed objective if necessary.

It's generally a good idea to keep an eye on the fraction of your team's resources allocated to committed objectives. Too little, and your team is promising too little to its stakeholders; too much, and you are at risk of breaking your promises, as there is nothing you can safely drop if you find yourself behind on a committed objective. PeopleMath allows you to set a target "commit ratio", and tells you how your plan compares to that target.

### Summary view

There is a read-only "period summary" view that shows which objectives are committed, aspirational and rejected in each bucket. This is useful for sharing with stakeholders, as it will always stay up-to-date with your plan.

### Grouping and tagging

Sometimes it is helpful to work at a less granular level than individual objectives.

For example, when working with more senior stakeholders to prioritise work, it may be helpful to group objectives together, for example by project, so users can easily see how a team's resources are being split between projects, and discuss priorities at a higher level.

For this use case, PeopleMath supports arbitrary grouping for objectives. Each objective can be marked with a set of key-value pairs, e.g. `project:X, program:Y`. For each key, you will then get a breakdown of objectives by the values, both on the right-hand side of the main period view and in the "period summary" view. The latter allows the individual objectives to be toggled on and off, and also allows you to toggle between a stack-ranked per-bucket view and an aggregate view across all buckets (in descending order of resources allocated, since objectives from different buckets cannot be compared in priority by definition).

It is also useful to be able to mark objectives with particular themes. For this, PeopleMath supports tagging: each objective can be marked with a list of tags, e.g. `KeepTheLightsOn, TechDebtReduction`. For each tag, you get a breakdown of the objectives marked with that tag.

Groups are a mutually-exclusive concept: for a single grouping key, each objective is a member of at most one group. Tags, by contrast, have a free many-to-many relationship with objectives.

### Reordering and objective blocks

PeopleMath allows you to easily drag objectives up and down to change the priority stack ranking within a bucket. To do this, click on the [reordering icon](https://fonts.google.com/icons?selected=Material%20Icons%3Areorder%3A) which appears in the bottom right when you enter edit mode.

That same icon will then appear to the left of each objective. You can click and drag these icons to reorder objectives.

You can also reorder buckets in this mode, by clicking the up and down arrows which appear in the bucket header.

Sometimes there is a set of adjacent objectives which you always want to move together when reordering. Having to manually move each one individually can be very laborious. To help with this, PeopleMath supports the concept of a _block_ of objectives, which are adjacent in the stack rank and always moved together.

Click the [grouping icon](https://fonts.google.com/icons?selected=Material%20Icons%3Agroup_work%3A) in edit mode, and again, the same icon will appear to the left of each objective. Click the icon on the top item in your desired block, and a dialog will pop up allowing you to select how many of the items below you want in the block.

Once the block is created, it will appear collapsed as a single item in reordering mode; when you exit reordering mode, the individual objectives will reappear.

To split a block back into its original objectives, click on the grouping icon next to the block, and click the "split" button at the bottom of the dialog.

### Permissions

Thanks to contributions from [Samrthi](https://github.com/Samrthi), it is possible to configure PeopleMath so that read and write access is limited to certain users.

Users are identified using [Firebase Authentication](https://firebase.google.com/docs/auth). Currently, the only underlying authentication method supported is [Google Sign-in](https://developers.google.com/identity/sign-in/web).

Users can be granted permissions individually (e.g. "allow Alice to write team X") or by the domain of their verified email address (e.g. "let anyone with a verified @google.com email address read team Y").

Permissions to read the list of teams, or add a new team, are app-wide and live in the `GeneralPermissions` on the stored `Settings` object. Permissions to read and write data associated with specific teams are stored in each `Team` object under `Permissions`.

This feature is not yet quite complete: we do not yet have any functionality in the user interface to edit permissions. The only way to do this currently is by editing the settings or the team JSON manually.

The authentication functionality is disabled by default. To turn it on:

- Create a Firebase project in [the Firebase console](https://console.firebase.google.com/) and register your web app in it
- Add your web application's domain to the OAuth redirect domains list in the Firebase console (to get there: Firebase Console -> Authentication section -> Sign in method tab)
- [Download your Firebase config](https://support.google.com/firebase/answer/7015592#web) and copy the configuration object into `src/environments/firebaseConfig.ts`
- Set `requireAuth` to `true` in `src/environments/environment.prod.ts`
- [Download your Firebase credentials](https://firebase.google.com/docs/admin/setup#initialize-sdk) and export them via `export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/credentials.json"` (do NOT check these into version control)
- Run the backend with `--authmode firebase`

## Implementation

The front end was built using [Angular](https://angular.io) and [Angular Material](https://material.angular.io). The API server in the `backend` directory was written in [Go](https://golang.org).

The whole application was designed to run on [Google App Engine](https://cloud.google.com/appengine/), using [Google Cloud Datastore](https://cloud.google.com/datastore/) for persistence, though the front-end could be deployed with a back-end that used an entirely different persistence mechanism or runtime platform.

Storage functionality is abstracted in the backend using the `StorageService` interface.

The permissions functionality uses [Firebase Authentication](https://firebase.google.com/docs/auth). This is abstracted in the back-end using the `Auth` interface, but substituting a different authentication system into the front-end would be more difficult.

## Development

This section has information on how to work with this codebase.

If you intend to submit contributions to this repository, please also read [CONTRIBUTING.md](CONTRIBUTING.md) first.

### Local machine

The easiest way to work on the front end is to use the [Angular CLI](https://cli.angular.io/) (`npx ng serve`, `npx ng test` etc), after an `npm install` to install the dependencies.

In development mode, the CLI will [proxy](https://angular.io/guide/build#proxying-to-a-backend-server) API requests to a backend running on `localhost:8080`.

To run the backend server locally, install the [Go toolchain](https://golang.org/dl/) (1.14 or later), and run `go run . --inmemstore` in the `backend` directory. The `--inmemstore` argument will make the backend use a simple in-memory implementation of the API. This has no external dependencies, but data written will not survive a restart of the API server.

To persist the API data and exercise the Cloud Datastore persistence layer, the [Cloud Datastore emulator](https://cloud.google.com/datastore/docs/tools/datastore-emulator) can be used: install and start the emulator, then set the environment variables according to the instructions, set the `GOOGLE_CLOUD_PROJECT` environment variable, and start the backend server by running `go run .` with no arguments.

The front-end tests can be run via `npx ng test`, and the back-end tests via `go test ./...` in the `backend` directory.

By default, the permissions functionality is turned off. If you would like to test it using the in-memory datastore, follow the general instructions for turning on authentication above, and use the `--inmemstore` flag along with `--defaultdomain your.domain`. This `defaultdomain` will be granted both read and write access to all parts of the application, while users from other domains will be denied.

### Using Docker

An alternative way of running PeopleMath using [Docker Compose](https://docs.docker.com/compose/) has been contributed by GitHub user [vavilen84](https://github.com/vavilen84) (thank you!). This will benefit developers who like to use Docker tooling. This is community-supported and not actively maintained by anyone at Google.

Configuration for this lives in the `docker` folder. Currently, there is no configuration here suitable for production use, as the frontend container uses the Angular CLI, which is not designed to be a production-quality web server.

In order to use this workflow for development, you must first [install Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/).

Then, you can run PeopleMath by `cd`ing into the project's `docker/dev` folder and running `docker-compose up`. You should then be able to access PeopleMath on `localhost:4200`.

To stop the project, run `docker-compose down`.

### Continuous build

The project has a continuous build that uses [Google Cloud Build](https://cloud.google.com/cloud-build/). Pull requests will not be accepted until this continuous build passes.

The build uses the `Dockerfile` in the root of the project. It uses a base image which was constructed using the `Dockerfile` in the `build` directory.

To reproduce the behaviour of the continuous build, first construct the base image using `docker build -t peoplemath-build-base -f build/Dockerfile build`. Then replace the `FROM` clause of the root `Dockerfile` with `FROM peoplemath-build-base`, and run `docker build -t peoplemath-build .` from the root of the project.

If you wish to run the build on Google Cloud Build using your own resources, follow [these instructions](https://cloud.google.com/cloud-build/docs/quickstart-build?hl=en#build_using_dockerfile) using one of your own projects:

- If you have not already done so, enable Artifact Repository for your project, and create a Docker repository ([instructions](https://cloud.google.com/artifact-registry/docs/manage-repos)).
- Take a note of the Artifact Repository path, as you will need it for the commands below. It will be of the form `<REGION>-docker.pkg.dev/<PROJECT>/<REPO>`.
- Run `gcloud builds submit --tag <REPO_PATH>/base` from inside the `build` folder to generate the base image.
- Substitute that tag into the `FROM` clause in the root `Dockerfile`, and run `gcloud builds submit --tag <REPO_PATH>/peoplemath` from the root of the project to run the build.

Running the commands in the `Dockerfile` manually should give a pretty good sense of whether the build is likely to pass or not.

## Deployment to App Engine

The primary supported way of running PeopleMath in a staging or production configuration is on [Google App Engine](https://cloud.google.com/appengine/). To deploy the app to App Engine:

- Create a Google Cloud project as described in [the quickstart guide](https://cloud.google.com/appengine/docs/standard/go/quickstart)
- Run `gcloud config set project [YOUR_PROJECT_ID]`
- Run `build_appengine.sh` or equivalent commands to build the front-end and generate the `appengine_dist` directory
- `cd appengine_dist` and `gcloud app deploy`
