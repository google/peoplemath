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

  loadData(): void {
    const teamId = this.route.snapshot.paramMap.get('team');
    const periodId = this.route.snapshot.paramMap.get('period');
    this.okrStorage.getTeam(teamId).subscribe(team => this.team = team);
    this.okrStorage.getPeriod(teamId, periodId).subscribe(period => this.period = period);
  }
}
