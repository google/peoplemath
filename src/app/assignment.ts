// Copyright 2019-2021 Google LLC
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

export class Assignment {
  constructor(public personId: string, public commitment: number) {}
}

export class ImmutableAssignment {
  private _personId: string;
  private _commitment: number;

  get personId(): string {
    return this._personId;
  }
  get commitment(): number {
    return this._commitment;
  }

  constructor(a: Assignment) {
    this._personId = a.personId;
    this._commitment = a.commitment;
  }

  toOriginal(): Assignment {
    return new Assignment(this.personId, this.commitment);
  }
}

export function sumAssignments(
  assignments: (readonly ImmutableAssignment[])[]
): Assignment[] {
  let byPerson = new Map();
  for (const as of assignments) {
    for (const a of as) {
      if (byPerson.has(a.personId)) {
        byPerson.set(a.personId, byPerson.get(a.personId) + a.commitment);
      } else {
        byPerson.set(a.personId, a.commitment);
      }
    }
  }
  let result: Assignment[] = [];
  byPerson.forEach((c, p) => result.push({ personId: p, commitment: c }));
  return result;
}
