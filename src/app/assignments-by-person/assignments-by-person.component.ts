import { Component, OnInit, Input } from '@angular/core';
import { Period } from '../period';
import { Objective } from '../objective';
import { Assignment } from '../assignment';
import { Person, personDisplayNameWithUsername } from '../person';

@Component({
  selector: 'app-assignments-by-person',
  templateUrl: './assignments-by-person.component.html',
  styleUrls: ['./assignments-by-person.component.css']
})
export class AssignmentsByPersonComponent implements OnInit {
  @Input() period: Period;

  constructor() { }

  ngOnInit() {
  }

  assignmentsFor(person: Person): ObjectiveAssignment[] {
    const result = [];
    this.period.buckets.forEach(bucket => {
      bucket.objectives.forEach(objective => {
        objective.assignments.filter(assignment => assignment.personId === person.id)
                             .forEach(assignment => {
          const personId = assignment.personId;
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
}

class ObjectiveAssignment {
  constructor(
    public objective: Objective,
    public assignment: Assignment,
  ) {}
}