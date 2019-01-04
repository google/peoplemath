import { Injectable } from '@angular/core';
import { Team } from './team';
import { Period } from './period';
import { Bucket } from './bucket';
import { Person } from './person';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

// TODO Move to backend storage service

const BUCKETS: Bucket[] = [
  { id: 'a', displayName: 'First bucket', percentage: 40, objectives: [
    { name: 'A bucket 1 thing', resourceEstimate: 6 },
    { name: 'Another bucket 1 thing', resourceEstimate: 3, assignments: [
      { personId: 'alice', commitment: 2 },
    ] },
  ] },
  { id: 'b', displayName: 'Second bucket', percentage: 40, objectives: [
    { name: 'A bucket 2 thing', resourceEstimate: 12 },
    { name: 'Another bucket 2 thing', resourceEstimate: 1 },
  ] },
  { id: 'c', displayName: 'Third bucket', percentage: 20, objectives: [
    { name: 'A bucket 3 thing', resourceEstimate: 3 },
  ] },
];
const PEOPLE: Person[] = [
  { id: 'alice', displayName: 'Alice Anderson', availability: 3 },
  { id: 'bob', displayName: 'Bob Briggs', availability: 6 },
];

@Injectable()
export class OkrStorageService {

  constructor() { }

  getTeams(): Observable<Team[]> {
    return of([
      { id: 'team1', displayName: 'First Team' },
      { id: 'team2', displayName: 'Second Team' },
    ]);
  }

  getTeam(teamId: string): Observable<Team> {
    return of({ id: teamId, displayName: teamId });
  }

  getPeriods(teamId: string): Observable<Period[]> {
    return of([
      { id: '2018q2', displayName: '2018Q2' },
      { id: '2018q3', displayName: '2018Q3' },
    ]);
  }
  
  getPeriod(teamId: string, periodId: string): Observable<Period> {
    return of({ id: periodId, displayName: periodId, buckets: BUCKETS, people: PEOPLE, unit: 'person weeks' });
  }
}
