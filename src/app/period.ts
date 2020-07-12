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

import { Bucket, ImmutableBucket, bucketResourcesAllocated } from "./bucket";
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

// Boilerplate-reduction device
interface ImmutablePeriodIF {
  readonly id: string;
  readonly displayName: string;
  readonly unit: string;
  readonly notesURL: string;
  readonly maxCommittedPercentage: number;
  readonly buckets: readonly ImmutableBucket[];
  readonly people: readonly ImmutablePerson[];
  readonly secondaryUnits:  readonly ImmutableSecondaryUnit[];
  readonly lastUpdateUUID: string;
}

export class ImmutablePeriod implements ImmutablePeriodIF {
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

  private constructor(from: ImmutablePeriodIF) {
      this.id = from.id;
      this.displayName = from.displayName;
      this.unit = from.unit;
      this.notesURL = from.notesURL;
      this.maxCommittedPercentage = from.maxCommittedPercentage;
      this.buckets = from.buckets;
      this.people = from.people;
      this.secondaryUnits = from.secondaryUnits;
      this.lastUpdateUUID = from.lastUpdateUUID;
  }

  static fromPeriod(period: Period): ImmutablePeriod {
    return new ImmutablePeriod({
      id: period.id,
      displayName: period.displayName,
      unit: period.unit,
      notesURL: period.notesURL,
      maxCommittedPercentage: period.maxCommittedPercentage,
      buckets: period.buckets.map(b => ImmutableBucket.fromBucket(b)),
      people: period.people.map(p => new ImmutablePerson(p)),
      secondaryUnits: period.secondaryUnits.map(su => new ImmutableSecondaryUnit(su)),
      lastUpdateUUID: period.lastUpdateUUID,
    });
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

  withNewLastUpdateUUID(lastUpdateUUID: string): ImmutablePeriod {
    return new ImmutablePeriod({...this, lastUpdateUUID: lastUpdateUUID});
  }

  withNewBucket(bucket: ImmutableBucket): ImmutablePeriod {
    return new ImmutablePeriod({...this, buckets: this.buckets.concat([bucket])});
  }

  withBucketMovedUpOne(bucket: ImmutableBucket): ImmutablePeriod {
    let index = this.buckets.findIndex(b => b === bucket);
    let newBuckets: ImmutableBucket[] = [...this.buckets];
    if (index > 0) {
      newBuckets[index] = newBuckets[index - 1];
      newBuckets[index - 1] = bucket;
    }
    return new ImmutablePeriod({...this, buckets: newBuckets});
  }

  withBucketMovedDownOne(bucket: ImmutableBucket): ImmutablePeriod {
    let index = this.buckets.findIndex(b => b === bucket);
    let newBuckets: ImmutableBucket[] = [...this.buckets];
    if (index >= 0 && index < this.buckets.length - 1) {
      newBuckets[index] = newBuckets[index + 1];
      newBuckets[index + 1] = bucket;
    }
    return new ImmutablePeriod({...this, buckets: newBuckets});
  }

  withBucketChanged(from: ImmutableBucket, to: ImmutableBucket): ImmutablePeriod {
    let newBuckets = this.buckets.map(b => (b == from) ? to : b);
    return new ImmutablePeriod({...this, buckets: newBuckets});
  }

  withNewPeople(people: readonly ImmutablePerson[]): ImmutablePeriod {
    return new ImmutablePeriod({...this, people: people});
  }
}

/**
 * Total resources for this period which have been allocated to objectives
 * TODO: Consider making this and similar cases into member functions on the Immutable classes
 */
export function periodResourcesAllocated(period: ImmutablePeriod): number {
  return period.buckets
      .map(bucketResourcesAllocated)
      .reduce((sum, prev) => sum + prev, 0);
}
