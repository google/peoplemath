import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Bucket } from '../bucket';
import { Person } from '../person';
import { Period } from '../period';
import { Team } from '../team';

// TODO Move to service
const BUCKETS: Bucket[] = [
  { id: 'a', displayName: 'First bucket', percentage: 40, objectives: [
    { name: 'A bucket 1 thing', resourceEstimate: 6 },
    { name: 'Another bucket 1 thing', resourceEstimate: 3 },
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

@Component({
  selector: 'app-period',
  templateUrl: './period.component.html',
  styleUrls: ['./period.component.css']
})
export class PeriodComponent implements OnInit {
  team: Team;
  period: Period;

  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData(): void {
    const teamId = this.route.snapshot.paramMap.get('team');
    const periodId = this.route.snapshot.paramMap.get('period');
    // TODO Move to service
    this.team = { id: teamId, displayName: teamId };
    this.period = { id: periodId, displayName: periodId, buckets: BUCKETS, people: PEOPLE, unit: 'person weeks' };
  }
}
