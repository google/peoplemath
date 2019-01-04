#!/bin/bash
# Prepare prod app for deployment to Google AppEngine using gcloud app deploy

if [[ -e appengine_dist ]]; then
    echo Remove appengine_dist first, e.g. via rm -rf
    exit 1
fi

mkdir appengine_dist

ng build --prod
cp backend/* appengine_dist
mkdir appengine_dist/static
cp dist/peoplemath/* appengine_dist/static
