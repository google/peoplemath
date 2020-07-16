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
import { List } from 'immutable';

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

export class ImmutableObjective {
  readonly name: string;
  readonly resourceEstimate: number;
  readonly commitmentType?: CommitmentType;
  readonly notes: string;
  readonly groups: List<ImmutableObjectiveGroup>;
  readonly tags: List<ImmutableObjectiveTag>;
  readonly assignments: List<ImmutableAssignment>;
  
  constructor(o: Objective) {
    this.name = o.name;
    this.resourceEstimate = o.resourceEstimate;
    this.commitmentType = o.commitmentType;
    this.notes = o.notes;
    this.groups = List(o.groups.map(g => new ImmutableObjectiveGroup(g)));
    this.tags = List(o.tags.map(t => new ImmutableObjectiveTag(t)));
    this.assignments = List(o.assignments.map(a => new ImmutableAssignment(a)));
  }

  toOriginal(): Objective {
    return {
      name: this.name,
      resourceEstimate: this.resourceEstimate,
      commitmentType: this.commitmentType,
      notes: this.notes,
      groups: this.groups.toArray().map(g => g.toOriginal()),
      tags: this.tags.toArray().map(t => t.toOriginal()),
      assignments: this.assignments.toArray().map(a => a.toOriginal()),
    };
  }
}

/**
 * Sum of resources allocated to the given objective.
 * Not a member function to avoid problems with (de)serialization.
 * @deprecated To be removed when we use ImmutableObjective everywhere.
 */
export function objectiveResourcesAllocated(objective: Objective): number {
  return objective.assignments
    .map(assignment => assignment.commitment)
    .reduce((sum, current) => sum + current, 0);
}

/**
 * Sum of resources allocated to the given objective.
 * Not a member function to avoid problems with (de)serialization.
 */
export function objectiveResourcesAllocatedI(objective: ImmutableObjective): number {
  return objective.assignments
    .map(assignment => assignment.commitment)
    .reduce((sum, current) => sum + current, 0);
}

/**
 * Sum of resources allocated to a number of objectives.
 * @deprecated To be removed when we use ImmutableObjective everywhere.
 */
export function totalResourcesAllocated(objectives: Objective[]): number {
  return objectives.reduce((sum, ob) => sum + objectiveResourcesAllocated(ob), 0);
}

/**
 * Sum of resources allocated to a number of objectives.
 */
export function totalResourcesAllocatedI(objectives: ImmutableObjective[]): number {
  return objectives.reduce((sum, ob) => sum + objectiveResourcesAllocatedI(ob), 0);
}
