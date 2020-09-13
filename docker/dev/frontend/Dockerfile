# Copyright 2020 Google LLC
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

FROM node:lts

WORKDIR /usr/app/
COPY ./ ./
RUN rm -rf backend && \
    rm -rf docker && \
    npm install -g @angular/cli @angular-devkit/build-angular && \
    npm install && \
    sed -i 's/localhost/backend/g' src/devproxy.conf.json

CMD ng serve --port 4200 --host 0.0.0.0 --disable-host-check
