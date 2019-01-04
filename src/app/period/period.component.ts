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
  styleUrls: ['./period.component.css']
})
export class PeriodComponent implements OnInit {
  team: Team;
  period: Period;

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
        .map(bucket => this.bucketCommitted(bucket))
        .reduce((sum, prev) => sum + prev, 0);
  }

  /**
   * Total resources for this period which have not been committed to objectives
   */
  totalUncommitted(): number {
    return this.totalAvailable() - this.totalCommitted();
  }

  /**
   * Resources allocated to the given bucket in this period, based on total available
   * and bucket allocation percentage.
   */
  bucketAllocation(bucket: Bucket): number {
    return this.totalAvailable() * bucket.allocationPercentage / 100;
  }

  private assignedObjectives(bucket: Bucket): Objective[] {
    return bucket.objectives.filter(objective => objective.assignments);
  }

  private bucketAssignments(bucket: Bucket): Assignment[] {
    return this.assignedObjectives(bucket)
        .map(objective => objective.assignments)
        .reduce((prev, current) => prev.concat(current), []);
  }

  /**
   * Sum of resources committed to objectives in the given bucket
   */
  bucketCommitted(bucket: Bucket): number {
    return this.bucketAssignments(bucket)
        .map(assignment => assignment.commitment)
        .reduce((sum, current) => sum + current, 0);
  }

  private personAssignments(person: Person): PersonAssignment[] {
    let result: PersonAssignment[] = [];
    this.period.buckets.forEach(bucket => {
      this.assignedObjectives(bucket).forEach(objective => {
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