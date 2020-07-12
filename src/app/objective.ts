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

import { Assignment, ImmutableAssignment } from "./assignment";

export enum CommitmentType { Aspirational = "Aspirational", Committed = "Committed" }

export interface ObjectiveGroup {
  groupType: string;
  groupName: string;
}

export class ImmutableObjectiveGroup {
  private readonly _groupType: string;
  private readonly _groupName: string;

  get groupType(): string { return this._groupType; }
  get groupName(): string { return this._groupName; }
  
  constructor(g: ObjectiveGroup) {
    this._groupType = g.groupType;
    this._groupName = g.groupName;
  }

  toOriginal(): ObjectiveGroup {
    return {groupType: this.groupType, groupName: this.groupName};
  }
}

export interface ObjectiveTag {
  name: string;
}

export class ImmutableObjectiveTag {
  private readonly _name: string;

  get name(): string { return this._name; }

  constructor(t: ObjectiveTag) {
    this._name = t.name;
  }

  toOriginal(): ObjectiveTag {
    return {name: this.name};
  }
}

export interface Objective {
  name: string,
  resourceEstimate: number,
  commitmentType?: CommitmentType,
  notes: string,
  groups: ObjectiveGroup[],
  tags: ObjectiveTag[],
  assignments: Assignment[],
}

// Boilerplate avoidance device
interface ImmutableObjectiveIF {
  readonly name: string;
  readonly resourceEstimate: number;
  readonly commitmentType?: CommitmentType;
  readonly notes: string;
  readonly groups: readonly ImmutableObjectiveGroup[];
  readonly tags: readonly ImmutableObjectiveTag[];
  readonly assignments: readonly ImmutableAssignment[];
}

export class ImmutableObjective {
  // The readonly arrays here mean we don't need getter boilerplate
  // to avoid ImmutableObjective being assignable to Objective.
  readonly name: string;
  readonly resourceEstimate: number;
  readonly commitmentType?: CommitmentType;
  readonly notes: string;
  readonly groups: readonly ImmutableObjectiveGroup[];
  readonly tags: readonly ImmutableObjectiveTag[];
  readonly assignments: readonly ImmutableAssignment[];
  
  private constructor(o: ImmutableObjectiveIF) {
    this.name = o.name;
    this.resourceEstimate = o.resourceEstimate;
    this.commitmentType = o.commitmentType;
    this.notes = o.notes;
    this.groups = o.groups;
    this.tags = o.tags;
    this.assignments = o.assignments;
  }

  static fromObjective(objective: Objective): ImmutableObjective {
    return new ImmutableObjective({
      name: objective.name,
      resourceEstimate: objective.resourceEstimate,
      commitmentType: objective.commitmentType,
      notes: objective.notes,
      groups: objective.groups.map(g => new ImmutableObjectiveGroup(g)),
      tags: objective.tags.map(t => new ImmutableObjectiveTag(t)),
      assignments: objective.assignments.map(a => new ImmutableAssignment(a)),
    });
  }

  toOriginal(): Objective {
    return {
      name: this.name,
      resourceEstimate: this.resourceEstimate,
      commitmentType: this.commitmentType,
      notes: this.notes,
      groups: this.groups.map(g => g.toOriginal()),
      tags: this.tags.map(t => t.toOriginal()),
      assignments: this.assignments.map(a => a.toOriginal()),
    };
  }

  withAssignments(newAssignments: readonly ImmutableAssignment[]): ImmutableObjective {
    return new ImmutableObjective({...this, assignments: newAssignments});
  }
}

/**
 * Sum of resources allocated to the given objective.
 * Not a member function to avoid problems with (de)serialization.
 */
export function objectiveResourcesAllocated(objective: ImmutableObjective): number {
  return objective.assignments
    .map(assignment => assignment.commitment)
    .reduce((sum, current) => sum + current, 0);
}

/**
 * Sum of resources allocated to a number of objectives.
 */
export function totalResourcesAllocated(objectives: readonly ImmutableObjective[]): number {
  return objectives.reduce((sum, ob) => sum + objectiveResourcesAllocated(ob), 0);
}
