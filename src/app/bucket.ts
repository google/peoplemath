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

import { Objective, CommitmentType, ImmutableObjective } from './objective';
import { ImmutablePerson } from './person';

export class Bucket {
  constructor(
    public displayName: string,
    public allocationPercentage: number,
    public objectives: Objective[],
  ) {}
}

export class ImmutableBucket {
  // The readonly array means ImmutableBucket should not be assignable to Bucket,
  // so we can save typing on getters here.
  readonly displayName: string;
  readonly allocationPercentage: number;
  readonly objectives: readonly ImmutableObjective[];

  private constructor(
    displayName: string, allocationPercentage: number,
    objectives: readonly ImmutableObjective[]) {
    this.displayName = displayName;
    this.allocationPercentage = allocationPercentage;
    this.objectives = objectives;
  }

  static fromBucket(bucket: Bucket): ImmutableBucket {
    return new ImmutableBucket(
      bucket.displayName, bucket.allocationPercentage,
      bucket.objectives.map(o => ImmutableObjective.fromObjective(o)));
  }

  toOriginal(): Bucket {
    return new Bucket(
      this.displayName, this.allocationPercentage,
      this.objectives.map(o => o.toOriginal()));
  }

  withNewObjectives(newObjectives: readonly ImmutableObjective[]): ImmutableBucket {
    return new ImmutableBucket(this.displayName, this.allocationPercentage, newObjectives);
  }

  withNewObjective(objective: ImmutableObjective): ImmutableBucket {
    return this.withNewObjectives(this.objectives.concat([objective]));
  }

  private objectiveIndex(objective: ImmutableObjective): number {
    return this.objectives.findIndex(o => o === objective);
  }

  withObjectiveDeleted(objective: ImmutableObjective): ImmutableBucket {
    const index = this.objectiveIndex(objective);
    if (index < 0) {
      return this;
    }
    const newObjectives = [...this.objectives];
    newObjectives.splice(index, 1);
    return this.withNewObjectives(newObjectives);
  }

  withObjectiveChanged(original: ImmutableObjective, newObjective: ImmutableObjective): ImmutableBucket {
    const index = this.objectiveIndex(original);
    if (index < 0) {
      return this;
    }
    const newObjectives = [...this.objectives];
    newObjectives[index] = newObjective;
    return this.withNewObjectives(newObjectives);
  }

  withPersonDeleted(person: ImmutablePerson): ImmutableBucket {
    const newObjectives = this.objectives.map(o => o.withPersonDeleted(person));
    return this.withNewObjectives(newObjectives);
  }

  withGroupRenamed(groupType: string, oldName: string, newName: string): ImmutableBucket {
    const newObjectives = this.objectives.map(o => o.withGroupRenamed(groupType, oldName, newName));
    return this.withNewObjectives(newObjectives);
  }

  withTagRenamed(oldName: string, newName: string): ImmutableBucket {
    const newObjectives = this.objectives.map(o => o.withTagRenamed(oldName, newName));
    return this.withNewObjectives(newObjectives);
  }

  /**
   * Sum of resources allocated to the bucket.
   */
  resourcesAllocated(): number {
    return this.objectives
      .map(o => o.resourcesAllocated())
      .reduce((sum, current) => sum + current, 0);
  }

  /**
   * Sum of resources allocated to committed resources within the bucket.
   */
  committedResourcesAllocated(): number {
    return this.objectives.filter(o => o.commitmentType == CommitmentType.Committed)
        .map(o => o.resourcesAllocated())
        .reduce((sum, current) => sum + current, 0);
  }
}
