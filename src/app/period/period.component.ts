import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Bucket } from '../bucket';
import { Person } from '../person';
import { Period } from '../period';
import { Team } from '../team';
import { OkrStorageService } from '../okrstorage.service';

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

  totalAvailable(): number {
    return this.period.people
        .map(person => person.availability)
        .reduce((sum, current) => sum + current, 0);
  }

  bucketAllocation(bucket: Bucket): number {
    return this.totalAvailable() * bucket.allocationPercentage / 100;
  }

  bucketCommitted(bucket: Bucket): number {
    return bucket.objectives
        .filter(objective => objective.assignments)
        .map(objective => objective.assignments)
        .reduce((prev, current) => prev.concat(current), [])
        .map(assignment => assignment.commitment)
        .reduce((sum, current) => sum + current, 0);
  }

  loadData(): void {
    const teamId = this.route.snapshot.paramMap.get('team');
    const periodId = this.route.snapshot.paramMap.get('period');
    this.okrStorage.getTeam(teamId).subscribe(team => this.team = team);
    this.okrStorage.getPeriod(teamId, periodId).subscribe(period => this.period = period);
  }
}
