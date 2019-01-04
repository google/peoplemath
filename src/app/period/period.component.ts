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

  peopleCommitments(): Map<string, number> {
    let result: Map<string, number> = new Map();
    this.period.buckets.forEach(bucket => {
      bucket.objectives.forEach(objective => {
        objective.assignments.forEach(assignment => {
          let personId = assignment.personId;
          if (!result.has(personId)) {
            result.set(personId, 0);
          }
          result.set(personId, result.get(personId) + assignment.commitment);
        })
      })
    });
    return result;
  }

  loadData(): void {
    const teamId = this.route.snapshot.paramMap.get('team');
    const periodId = this.route.snapshot.paramMap.get('period');
    this.okrStorage.getTeam(teamId).subscribe(team => this.team = team);
    this.okrStorage.getPeriod(teamId, periodId).subscribe(period => this.period = period);
  }
}
