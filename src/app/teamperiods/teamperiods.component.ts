import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Period } from '../period';
import { Team } from '../team';

// TODO Move to service, make team-dependent
const PERIODS: Period[] = [
  { id: '2018q2', displayName: '2018Q2' },
  { id: '2018q3', displayName: '2018Q3' },
];

@Component({
  selector: 'app-teamperiods',
  templateUrl: './teamperiods.component.html',
  styleUrls: ['./teamperiods.component.css']
})
export class TeamPeriodsComponent implements OnInit {
  team: Team;
  periods: Period[] = PERIODS;

  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.loadTeam();
  }

  loadTeam(): void {
    const teamId = this.route.snapshot.paramMap.get('team');
    // TODO service
    this.team = { id: teamId, displayName: 'Dunno' };
  }
}
