import { Component, OnInit } from '@angular/core';
import { Team } from '../team';
import { OkrStorageService } from '../okrstorage.service';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {
  teams: Team[];

  constructor(
    private okrStorage: OkrStorageService,
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData(): void {
    this.okrStorage.getTeams().subscribe(teams => this.teams = teams);
  }
}
