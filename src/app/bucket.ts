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

import { Objective, objectiveResourcesAllocated, CommitmentType, ImmutableObjective, objectiveResourcesAllocatedI } from "./objective";

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

  constructor(bucket: Bucket) {
    this.displayName = bucket.displayName;
    this.allocationPercentage = bucket.allocationPercentage;
    this.objectives = bucket.objectives.map(o => new ImmutableObjective(o));
  }

  toOriginal(): Bucket {
    return new Bucket(
      this.displayName, this.allocationPercentage,
      this.objectives.map(o => o.toOriginal()));
  }
}

/**
 * Sum of resources allocated to the bucket.
 * Not a member function to avoid problems with JSON (de)serialization.
 * @deprecated To be removed when we use ImmutableBucket everywhere.
 */
export function bucketResourcesAllocated(bucket: Bucket): number {
  return bucket.objectives
    .map(objectiveResourcesAllocated)
    .reduce((sum, current) => sum + current, 0);
}

/**
 * Sum of resources allocated to the bucket.
 * Not a member function to avoid problems with JSON (de)serialization.
 */
export function bucketResourcesAllocatedI(bucket: ImmutableBucket): number {
  return bucket.objectives
    .map(objectiveResourcesAllocatedI)
    .reduce((sum, current) => sum + current, 0);
}

/**
 * Sum of resources allocated to committed resources within the bucket.
 * Not a member function to avoid problems with JSON (de)serialization.
 */
export function bucketCommittedResourcesAllocated(bucket: Bucket): number {
  return bucket.objectives.filter(o => o.commitmentType == CommitmentType.Committed)
      .map(objectiveResourcesAllocated)
      .reduce((sum, current) => sum + current, 0);
}