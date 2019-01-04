import { Injectable } from '@angular/core';
import { Team } from './team';
import { Period } from './period';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class OkrStorageService {

  constructor(private http: HttpClient) { }

  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>('/api/team/');
  }

  getTeam(teamId: string): Observable<Team> {
    return this.http.get<Team>('/api/team/' + teamId);
  }

  addTeam(team: Team): Observable<any> {
    let options = {headers: new HttpHeaders({'Content-Type': 'application.json'})};
    return this.http.post('/api/team/', team, options);
  }

  getPeriods(teamId: string): Observable<Period[]> {
    return this.http.get<Period[]>('/api/period/' + teamId + '/');
  }
  
  getPeriod(teamId: string, periodId: string): Observable<Period> {
    return this.http.get<Period>('/api/period/' + teamId + '/' + periodId);
  }
}
