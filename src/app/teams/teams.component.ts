import { Component, OnInit } from '@angular/core';
import { Team } from '../team';

// TODO Use backend service
const TEAMS: Team[] = [
  { id: 'team1', displayName: 'First Team' },
  { id: 'team2', displayName: 'Second Team' },
];

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {
  teams: Team[] = TEAMS;

  constructor() { }

  ngOnInit() {
  }

}
