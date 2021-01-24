// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Injectable } from '@angular/core';
import {Team, TeamList} from './team';
import { Period } from './period';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ObjectUpdateResponse } from './objectupdateresponse';

@Injectable()
export class StorageService {

  constructor(private http: HttpClient) { }

  getTeams(): Observable<TeamList> {
    return this.http.get<TeamList>('/api/team/');
  }

  getTeam(teamId: string): Observable<Team> {
    return this.http.get<Team>('/api/team/' + teamId);
  }

  addTeam(team: Team): Observable<unknown> {
    const options = {headers: new HttpHeaders({'Content-Type': 'application/json'})};
    return this.http.post('/api/team/', team, options);
  }

  updateTeam(team: Team): Observable<unknown> {
    const options = {headers: new HttpHeaders({'Content-Type': 'application/json'})};
    return this.http.put('/api/team/' + team.id, team, options);
  }

  getPeriods(teamId: string): Observable<Period[]> {
    return this.http.get<Period[]>('/api/period/' + teamId + '/');
  }

  getPeriod(teamId: string, periodId: string): Observable<Period> {
    return this.http.get<Period>('/api/period/' + teamId + '/' + periodId);
  }

  addPeriod(teamId: string, period: Period): Observable<ObjectUpdateResponse> {
    const options = {headers: new HttpHeaders({'Content-Type': 'application/json'})};
    return this.http.post<ObjectUpdateResponse>('/api/period/' + teamId + '/', period, options);
  }

  updatePeriod(teamId: string, period: Period): Observable<ObjectUpdateResponse> {
    const options = {headers: new HttpHeaders({'Content-Type': 'application/json'})};
    return this.http.put<ObjectUpdateResponse>('/api/period/' + teamId + '/' + period.id, period, options);
  }
}
