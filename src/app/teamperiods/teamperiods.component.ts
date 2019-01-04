import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Period } from '../period';
import { Team } from '../team';
import { OkrStorageService } from '../okrstorage.service';


@Component({
  selector: 'app-teamperiods',
  templateUrl: './teamperiods.component.html',
  styleUrls: ['./teamperiods.component.css']
})
export class TeamPeriodsComponent implements OnInit {
  team: Team;
  periods: Period[];

  constructor(
    private okrStorage: OkrStorageService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData(): void {
    const teamId = this.route.snapshot.paramMap.get('team');
    this.okrStorage.getTeam(teamId).subscribe(team => this.team = team);
    this.okrStorage.getPeriods(teamId).subscribe(periods => this.periods = periods);
  }
}
