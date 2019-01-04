import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Bucket } from '../bucket';
import { Person } from '../person';
import { Period } from '../period';
import { Team } from '../team';
import { OkrStorageService } from '../okrstorage.service';
import { Objective } from '../objective';
import { Assignment } from '../assignment';

@Component({
  selector: 'app-period',
  templateUrl: './period.component.html',
  styleUrls: ['./period.component.css'],
  providers: [
  ],
})
export class PeriodComponent implements OnInit {
  team: Team;
  period: Period;
  defaultPersonAvailability: number = 6;

  constructor(
    private okrStorage: OkrStorageService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.loadData();
  }

  /**
   * Total resources available for the period across all people
   */
  totalAvailable(): number {
    return this.period.people
        .map(person => person.availability)
        .reduce((sum, current) => sum + current, 0);
  }

  /**
   * Total resources for this period which have been committed to objectives
   */
  totalCommitted(): number {
    return this.period.buckets
        .map(bucket => bucket.resourcesCommitted())
        .reduce((sum, prev) => sum + prev, 0);
  }

  /**
   * Total resources for this period which have not been committed to objectives
   */
  totalUncommitted(): number {
    return this.totalAvailable() - this.totalCommitted();
  }

  /**
   * Sum of bucket allocation percentages. Should generally be 100 (and never more).
   */
  totalAllocationPercentage(): number {
    return this.period.buckets
        .map(bucket => bucket.allocationPercentage)
        .reduce((sum, current) => sum + current, 0);
  }

  private personAssignments(person: Person): PersonAssignment[] {
    let result: PersonAssignment[] = [];
    this.period.buckets.forEach(bucket => {
      bucket.assignedObjectives().forEach(objective => {
        objective.assignments
            .filter(assignment => assignment.personId === person.id)
            .forEach(assignment => result.push(new PersonAssignment(objective, assignment)));
      });
    });
    return result;
  }

  /**
   * Amount of the given person's resources committed to objectives during this period.
   */
  personCommitted(person: Person): number {
    return this.personAssignments(person)
        .map(pa => pa.assignment.commitment)
        .reduce((sum, current) => sum + current, 0);
  }

  /**
   * Amount of the given person's resources not committed to objectives during this period.
   */
  personUncommitted(person: Person): number {
    return person.availability - this.personCommitted(person);
  }

  addPerson(): void {
    const person = new Person();
    person.availability = this.defaultPersonAvailability;
    this.period.people.push(person);
  }

  loadData(): void {
    const teamId = this.route.snapshot.paramMap.get('team');
    const periodId = this.route.snapshot.paramMap.get('period');
    this.okrStorage.getTeam(teamId).subscribe(team => this.team = team);
    this.okrStorage.getPeriod(teamId, periodId).subscribe(period => this.period = period);
  }
}

class PersonAssignment {
  constructor(
    public objective: Objective,
    public assignment: Assignment,
  ) {}
}