# Copyright 2020-2021 Google LLC
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

FROM us-central1-docker.pkg.dev/peoplemath-build/peoplemath/base

COPY . /build/

WORKDIR /build/backend
RUN ["go", "test", "./..."]
RUN ["/bin/bash", "-c", "if [[ \"$(gofmt -l . | wc -l)\" -gt 0 ]]; then echo Go formatting violations exist; exit 1; else echo Go formatting check passed ; fi"]

WORKDIR /build
RUN ["/bin/bash", "-c", "npm ci |& tee /tmp/ci.log"]
RUN ["/usr/bin/perl", "-lne", "next unless /deprecated (.*@[^:]*):/; print \"Import path of deprecated $1:\"; system(\"npm list $1 --depth=20\") == 0 or die \"$!\"", "/tmp/ci.log"]
RUN ["npx", "ng", "lint"]
RUN ["npx", "ng", "test", "--watch=false", "--browsers", "ChromeHeadlessNoSandbox"]
RUN ["npx", "prettier", "--check", "."]
RUN ["/bin/bash", "-c", "find . -path ./node_modules -prune -o \\( -name \\*.ts -o -name \\*.go \\) -print | xargs $HOME/go/bin/addlicense -check"]
RUN ["bash", "build_appengine.sh"]
RUN ["ls", "-lhR", "appengine_dist"]

