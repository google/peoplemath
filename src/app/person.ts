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

export class ImmutablePerson {
    private readonly _id: string;
    private readonly _displayName: string;
    private readonly _location: string;
    private readonly _availability: number;

    get id(): string { return this._id; }
    get displayName(): string { return this._displayName; }
    get location(): string { return this._location; }
    get availability(): number { return this._availability; }

    constructor(person: Person) {
        this._id = person.id;
        this._displayName = person.displayName;
        this._location = person.location;
        this._availability = person.availability;
    }

    toOriginal(): Person {
        return new Person(this.id, this.displayName, this.location, this.availability);
    }

    displayNameWithUsername(): string {
        if (this.id === this.displayName || !this.displayName) {
            return this.id;
        }
        return this.displayName + ' (' + this.id + ')';
    }
}
