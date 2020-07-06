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

import { Component, OnInit, Input } from '@angular/core';
import { Period } from '../period';
import { Objective, CommitmentType } from '../objective';
import { Assignment } from '../assignment';
import { Person, personDisplayNameWithUsername } from '../person';

@Component({
  selector: 'app-assignments-by-person',
  templateUrl: './assignments-by-person.component.html',
  styleUrls: ['./assignments-by-person.component.css']
})
export class AssignmentsByPersonComponent implements OnInit {
  @Input() period?: Period;

  constructor() { }

  ngOnInit() {
  }

  hasAssignments(person: Person): boolean {
    for (let bucket of this.period!.buckets) {
      for (let objective of bucket.objectives) {
        for (let assignment of objective.assignments) {
          if (assignment.personId === person.id) {
            return true;
          }
        }
      }
    }
    return false;
  }

  assignmentsFor(person: Person): ObjectiveAssignment[] {
    const result: ObjectiveAssignment[] = [];
    this.period!.buckets.forEach(bucket => {
      bucket.objectives.forEach(objective => {
        objective.assignments.filter(assignment => assignment.personId === person.id)
                             .forEach(assignment => {
          result.push(new ObjectiveAssignment(objective, assignment));
        });
      });
    });
    // Sort in descending order of commitment
    result.sort((a,b) => b.assignment.commitment - a.assignment.commitment);
    return result;
  }

  personDisplayNameWithUsername(person: Person): string {
    return personDisplayNameWithUsername(person);
  }

  personTrackBy(_index: number, person: Person): string {
    return person.id;
  }

  assignmentsTrackBy(_index: number, oa: ObjectiveAssignment): string {
    return oa.objective.name;
  }
}

class ObjectiveAssignment {
  constructor(
    public objective: Objective,
    public assignment: Assignment,
  ) {}
}