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

import { Bucket, bucketResourcesAllocated, ImmutableBucket, bucketResourcesAllocatedI } from "./bucket";
import { Person, ImmutablePerson } from "./person";

export interface SecondaryUnit {
  name: string,
  conversionFactor: number,
}

export class ImmutableSecondaryUnit {
  private readonly _name: string;
  private readonly _conversionFactor: number;

  get name(): string { return this._name; }
  get conversionFactor(): number { return this._conversionFactor; }

  constructor(su: SecondaryUnit) {
    this._name = su.name;
    this._conversionFactor = su.conversionFactor;
  }

  toOriginal(): SecondaryUnit {
    return {name: this.name, conversionFactor: this.conversionFactor};
  }
}

export interface Period {
  id: string,
  displayName: string,
  unit: string,
  notesURL: string,
  maxCommittedPercentage: number,
  buckets: Bucket[],
  people: Person[],
  secondaryUnits: SecondaryUnit[],
  lastUpdateUUID: string,
}

export class ImmutablePeriod {
  // We can save typing on getters here since the readonly arrays mean ImmutablePeriod isn't assignable to Period
  readonly id: string;
  readonly displayName: string;
  readonly unit: string;
  readonly notesURL: string;
  readonly maxCommittedPercentage: number;
  readonly buckets: readonly ImmutableBucket[];
  readonly people: readonly ImmutablePerson[];
  readonly secondaryUnits:  readonly ImmutableSecondaryUnit[];
  readonly lastUpdateUUID: string;

  constructor(period: Period) {
    this.id = period.id;
    this.displayName = period.displayName;
    this.unit = period.unit;
    this.notesURL = period.notesURL;
    this.maxCommittedPercentage = period.maxCommittedPercentage;
    this.buckets = period.buckets.map(b => new ImmutableBucket(b));
    this.people = period.people.map(p => new ImmutablePerson(p));
    this.secondaryUnits = period.secondaryUnits.map(su => new ImmutableSecondaryUnit(su));
    this.lastUpdateUUID = period.lastUpdateUUID;
  }

  toOriginal(): Period {
    return {
      id: this.id,
      displayName: this.displayName,
      unit: this.unit,
      notesURL: this.notesURL,
      maxCommittedPercentage: this.maxCommittedPercentage,
      buckets: this.buckets.map(b => b.toOriginal()),
      people: this.people.map(p => p.toOriginal()),
      secondaryUnits: this.secondaryUnits.map(su => su.toOriginal()),
      lastUpdateUUID: this.lastUpdateUUID,
    };
  }
}

/**
 * Total resources for this period which have been allocated to objectives
 * @deprecated To be removed when we are using ImmutablePeriod everywhere
 */
export function periodResourcesAllocated(period: Period): number {
  return period.buckets
      .map(bucketResourcesAllocated)
      .reduce((sum, prev) => sum + prev, 0);
}

/**
 * Total resources for this period which have been allocated to objectives
 */
export function periodResourcesAllocatedI(period: ImmutablePeriod): number {
  return period.buckets
      .map(bucketResourcesAllocatedI)
      .reduce((sum, prev) => sum + prev, 0);
}
