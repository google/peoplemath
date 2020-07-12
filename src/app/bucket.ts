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

import { Objective, CommitmentType, ImmutableObjective, objectiveResourcesAllocated } from "./objective";

export class Bucket {
  constructor(
    public displayName: string,
    public allocationPercentage: number,
    public objectives: Objective[],
  ) {}
};

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
    const newObjectives = [...this.objectives];
    newObjectives.splice(index, 1);
    return this.withNewObjectives(newObjectives);
  }

  withObjectiveChanged(original: ImmutableObjective, newObjective: ImmutableObjective): ImmutableBucket {
    const index = this.objectiveIndex(original);
    const newObjectives = [...this.objectives];
    newObjectives[index] = newObjective;
    return this.withNewObjectives(newObjectives);
  }
}

/**
 * Sum of resources allocated to the bucket.
 * Not a member function to avoid problems with JSON (de)serialization.
 */
export function bucketResourcesAllocated(bucket: ImmutableBucket): number {
  return bucket.objectives
    .map(objectiveResourcesAllocated)
    .reduce((sum, current) => sum + current, 0);
}

/**
 * Sum of resources allocated to committed resources within the bucket.
 * Not a member function to avoid problems with JSON (de)serialization.
 */
export function bucketCommittedResourcesAllocated(bucket: ImmutableBucket): number {
  return bucket.objectives.filter(o => o.commitmentType == CommitmentType.Committed)
      .map(objectiveResourcesAllocated)
      .reduce((sum, current) => sum + current, 0);
}
