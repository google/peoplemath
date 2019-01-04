import { Injectable } from '@angular/core';
import { Team } from './team';
import { Period } from './period';
import { Bucket } from './bucket';
import { Person } from './person';
import { Observable, of } from 'rxjs';
import { Objective } from './objective';
import { Assignment } from './assignment';

// TODO Move to backend storage service

const BUCKETS: Bucket[] = [
  new Bucket('First bucket', 40, [
    new Objective('A bucket 1 thing', 6, []),
    new Objective('Another bucket 1 thing', 3, [
      new Assignment('alice', 2),
      new Assignment('bob', 1),
    ]),
  ]),
  new Bucket('Second bucket', 40, [
    new Objective('A bucket 2 thing', 12, []),
    new Objective('Another bucket 2 thing', 1, []),
  ]),
  new Bucket('Third bucket', 20, [
    new Objective('A bucket 3 thing', 3, []),
  ]),
];
const PEOPLE: Person[] = [
  new Person('alice', 'Alice Anderson', 3),
  new Person('bob', 'Bob Briggs', 6),
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
      new Period('2018q2', '2018Q2'),
      new Period('2018q3', '2018Q3'),
    ]);
  }
  
  getPeriod(teamId: string, periodId: string): Observable<Period> {
    return of(new Period(periodId, periodId, 'person weeks', BUCKETS, PEOPLE));
  }
}
