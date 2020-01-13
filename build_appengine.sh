#!/bin/bash -eu
#
# Copyright 2019 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

#!/bin/bash
# Prepare prod app for deployment to Google App Engine using gcloud app deploy

if [[ -e appengine_dist ]]; then
    echo Remove appengine_dist first, e.g. via rm -rf
    exit 1
fi

mkdir appengine_dist

ng build --prod
cp backend/* appengine_dist
mkdir appengine_dist/static
cp dist/peoplemath/* appengine_dist/static
