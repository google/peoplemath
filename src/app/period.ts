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

import { Bucket, ImmutableBucket } from './bucket';
import { Person, ImmutablePerson } from './person';
import { ImmutableObjective } from './objective';

export interface SecondaryUnit {
  name: string;
  conversionFactor: number;
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
  id: string;
  displayName: string;
  unit: string;
  notesURL: string;
  maxCommittedPercentage: number;
  buckets: Bucket[];
  people: Person[];
  secondaryUnits: SecondaryUnit[];
  lastUpdateUUID: string;
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
  readonly secondaryUnits: readonly ImmutableSecondaryUnit[];
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
  readonly secondaryUnits: readonly ImmutableSecondaryUnit[];
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
    return new ImmutablePeriod({...this, lastUpdateUUID});
  }

  private withNewBuckets(newBuckets: readonly ImmutableBucket[]): ImmutablePeriod {
    return new ImmutablePeriod({...this, buckets: newBuckets});
  }

  withNewBucket(bucket: ImmutableBucket): ImmutablePeriod {
    return new ImmutablePeriod({...this, buckets: this.buckets.concat([bucket])});
  }

  withBucketMovedUpOne(bucket: ImmutableBucket): ImmutablePeriod {
    const index = this.buckets.findIndex(b => b === bucket);
    const newBuckets: ImmutableBucket[] = [...this.buckets];
    if (index > 0) {
      newBuckets[index] = newBuckets[index - 1];
      newBuckets[index - 1] = bucket;
    }
    return this.withNewBuckets(newBuckets);
  }

  withBucketMovedDownOne(bucket: ImmutableBucket): ImmutablePeriod {
    const index = this.buckets.findIndex(b => b === bucket);
    const newBuckets: ImmutableBucket[] = [...this.buckets];
    if (index >= 0 && index < this.buckets.length - 1) {
      newBuckets[index] = newBuckets[index + 1];
      newBuckets[index + 1] = bucket;
    }
    return this.withNewBuckets(newBuckets);
  }

  withBucketChanged(from: ImmutableBucket, to: ImmutableBucket): ImmutablePeriod {
    const index = this.buckets.findIndex(b => b === from);
    if (index < 0) {
      return this;
    }
    const newBuckets = [...this.buckets];
    newBuckets[index] = to;
    return new ImmutablePeriod({...this, buckets: newBuckets});
  }

  private bucketIndex(bucket: ImmutableBucket): number {
    return this.buckets.findIndex(b => b === bucket);
  }

  withBucketDeleted(bucket: ImmutableBucket): ImmutablePeriod {
    const index = this.bucketIndex(bucket);
    if (index < 0) {
      return this;
    }
    const newBuckets = [...this.buckets];
    newBuckets.splice(index, 1);
    return this.withNewBuckets(newBuckets);
  }

  private withNewPeople(people: ImmutablePerson[]): ImmutablePeriod {
    people.sort((a, b) => a.id < b.id ? -1 : (a.id > b.id ? 1 : 0));
    return new ImmutablePeriod({...this, people});
  }

  withObjectiveMoved(oldObj: ImmutableObjective, from: ImmutableBucket, newObj: ImmutableObjective, to: ImmutableBucket): ImmutablePeriod {
    const newBuckets = [...this.buckets];
    const fromIdx = newBuckets.findIndex(b => b === from);
    if (fromIdx < 0) {
      throw Error('Could not find old bucket');
    }
    newBuckets[fromIdx] = newBuckets[fromIdx].withObjectiveDeleted(oldObj);
    const toIdx = newBuckets.findIndex(b => b === to);
    if (toIdx < 0) {
      throw Error('Could not find new bucket');
    }
    newBuckets[toIdx] = newBuckets[toIdx].withNewObjective(newObj);
    return this.withNewBuckets(newBuckets);
  }

  withPersonChanged(oldPerson: ImmutablePerson, newPerson: ImmutablePerson): ImmutablePeriod {
    if (oldPerson.id !== newPerson.id) {
      // We aren't doing the assignment updates etc that would be necessary for this
      throw Error('Cannot change person id');
    }
    const index = this.people.findIndex(p => p === oldPerson);
    if (index < 0) {
      return this;
    }
    const newPeople = [...this.people];
    newPeople[index] = newPerson;
    return this.withNewPeople(newPeople);
  }

  withNewPerson(person: ImmutablePerson): ImmutablePeriod {
    if (this.people.find(p => p.id === person.id)) {
      throw Error('A person with id ' + person.id + ' already exists');
    }
    const newPeople = [...this.people];
    newPeople.push(person);
    return this.withNewPeople(newPeople);
  }

  withPersonDeleted(person: ImmutablePerson): ImmutablePeriod {
    const index = this.people.findIndex(p => p === person);
    if (index < 0) {
      return this;
    }
    const newPeople = [...this.people];
    newPeople.splice(index, 1);
    // Deleting a person requires ensuring their assignments are deleted as well
    const newBuckets: ImmutableBucket[] = this.buckets.map(b => b.withPersonDeleted(person));
    return new ImmutablePeriod({...this, people: newPeople, buckets: newBuckets});
  }

  withGroupRenamed(groupType: string, oldName: string, newName: string): ImmutablePeriod {
    const newBuckets = this.buckets.map(b => b.withGroupRenamed(groupType, oldName, newName));
    return this.withNewBuckets(newBuckets);
  }

  withTagRenamed(oldName: string, newName: string): ImmutablePeriod {
    const newBuckets = this.buckets.map(b => b.withTagRenamed(oldName, newName));
    return this.withNewBuckets(newBuckets);
  }

  /**
   * Total resources for this period which have been allocated to objectives
   */
  resourcesAllocated(): number {
    return this.buckets
        .map(b => b.resourcesAllocated())
        .reduce((sum, prev) => sum + prev, 0);
  }
}
