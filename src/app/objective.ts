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

import { Assignment } from "./assignment";

export enum CommitmentType { Aspirational = "Aspirational", Committed = "Committed" }

export interface ObjectiveGroup {
  groupType: string;
  groupName: string;
}

export interface ObjectiveTag {
  name: string;
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

/**
 * Sum of resources allocated to the given objective.
 * Not a member function to avoid problems with (de)serialization.
 */
export function objectiveResourcesAllocated(objective: Objective): number {
  return objective.assignments
    .map(assignment => assignment.commitment)
    .reduce((sum, current) => sum + current, 0);
}

/**
 * Sum of resources allocated to a number of objectives.
 */
export function totalResourcesAllocated(objectives: Objective[]): number {
  return objectives.reduce((sum, ob) => sum + objectiveResourcesAllocated(ob), 0);
}