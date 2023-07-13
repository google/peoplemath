// Copyright 2019-2023 Google LLC
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

export enum AllocationType {
  Percentage = 'percentage',
  Absolute = 'absolute',
}

export interface Bucket {
  displayName: string;
  allocationType?: AllocationType;
  allocationPercentage: number;
  allocationAbsolute?: number;
  objectives: Objective[];
}

export class ImmutableBucket {
  // The readonly array means ImmutableBucket should not be assignable to Bucket,
  // so we can save typing on getters here.
  readonly displayName: string;
  readonly allocationPercentage: number;
  readonly allocationAbsolute: number;
  readonly objectives: readonly ImmutableObjective[];
  readonly allocationType: AllocationType;

  private constructor(
    displayName: string,
    allocationType: AllocationType,
    allocationPercentage: number,
    allocationAbsolute: number,
    objectives: readonly ImmutableObjective[]
  ) {
    this.displayName = displayName;
    this.allocationPercentage = allocationPercentage;
    this.allocationAbsolute = allocationAbsolute;
    this.objectives = objectives;
    this.allocationType = allocationType;
  }

  static fromBucket(bucket: Bucket): ImmutableBucket {
    return new ImmutableBucket(
      bucket.displayName,
      bucket.allocationType || AllocationType.Percentage,
      bucket.allocationPercentage,
      bucket.allocationAbsolute || 0,
      bucket.objectives.map((o) => ImmutableObjective.fromObjective(o))
    );
  }

  toOriginal(): Bucket {
    return {
      displayName: this.displayName,
      allocationType: this.allocationType,
      allocationPercentage: this.allocationPercentage,
      allocationAbsolute: this.allocationAbsolute,
      objectives: this.objectives.map((o) => o.toOriginal()),
    };
  }

  withNewObjectives(
    newObjectives: readonly ImmutableObjective[]
  ): ImmutableBucket {
    return new ImmutableBucket(
      this.displayName,
      this.allocationType,
      this.allocationPercentage,
      this.allocationAbsolute,
      newObjectives
    );
  }

  withNewObjectiveAtTop(objective: ImmutableObjective): ImmutableBucket {
    return this.withNewObjectives([objective].concat(this.objectives));
  }

  withNewObjectiveAtBottom(objective: ImmutableObjective): ImmutableBucket {
    return this.withNewObjectives(this.objectives.concat([objective]));
  }

  private objectiveIndex(objective: ImmutableObjective): number {
    return this.objectives.findIndex((o) => o === objective);
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

  withObjectiveChanged(
    original: ImmutableObjective,
    newObjective: ImmutableObjective
  ): ImmutableBucket {
    const index = this.objectiveIndex(original);
    if (index < 0) {
      return this;
    }
    const newObjectives = [...this.objectives];
    newObjectives[index] = newObjective;
    return this.withNewObjectives(newObjectives);
  }

  withPersonDeleted(person: ImmutablePerson): ImmutableBucket {
    const newObjectives = this.objectives.map((o) =>
      o.withPersonDeleted(person)
    );
    return this.withNewObjectives(newObjectives);
  }

  withGroupRenamed(
    groupType: string,
    oldName: string,
    newName: string
  ): ImmutableBucket {
    const newObjectives = this.objectives.map((o) =>
      o.withGroupRenamed(groupType, oldName, newName)
    );
    return this.withNewObjectives(newObjectives);
  }

  withTagRenamed(oldName: string, newName: string): ImmutableBucket {
    const newObjectives = this.objectives.map((o) =>
      o.withTagRenamed(oldName, newName)
    );
    return this.withNewObjectives(newObjectives);
  }

  /**
   * Sum of resources allocated to the bucket.
   */
  resourcesAllocated(): number {
    return this.objectives
      .map((o) => o.resourcesAllocated())
      .reduce((sum, current) => sum + current, 0);
  }

  /**
   * Sum of resources allocated to committed resources within the bucket.
   */
  committedResourcesAllocated(): number {
    return this.objectives
      .filter((o) => o.commitmentType === CommitmentType.Committed)
      .map((o) => o.resourcesAllocated())
      .reduce((sum, current) => sum + current, 0);
  }

  /**
   * Calculate allocation limit as a percentage of the team's total resources.
   * @param totalResourcesForPercent Team's total resources in the period,
   *  for percentage allocation (e.g. excluding any absolute allocations).
   * @param totalResources Team's total resources in the period.
   */
  allocationPercentageOfTotal(
    totalResourcesForPercent: number,
    totalResources: number
  ): number {
    switch (this.allocationType) {
      case AllocationType.Percentage:
        return (
          (this.allocationPercentage * totalResourcesForPercent) /
          totalResources
        );
      case AllocationType.Absolute:
        return (100 * this.allocationAbsolute) / totalResources;
    }
  }

  /**
   * Calculate allocation limit in absolute resource units.
   * @param totalResourcesForPercent Team's total resources in the period,
   *  for percentage allocation (excluding any absolute allocations).
   */
  getAllocationAbsolute(totalResourcesForPercent: number): number {
    switch (this.allocationType) {
      case AllocationType.Percentage:
        return (totalResourcesForPercent * this.allocationPercentage) / 100;
      case AllocationType.Absolute:
        return this.allocationAbsolute;
    }
  }
}
