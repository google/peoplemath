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

export class Person {
    constructor(
        public id: string,
        public displayName: string,
        public location: string,
        public availability: number,
    ) {}
}

export function personDisplayNameWithUsername(person: Person): string {
    if (person.id == person.displayName || !person.displayName) {
        return person.id;
    }
    return person.displayName + " (" + person.id + ")";
}
