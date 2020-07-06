// Copyright 2019-2020 Google LLC
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

import { TestBed } from '@angular/core/testing';

import { StorageService } from './storage.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Team } from './team';
import { Period } from './period';
import { ObjectUpdateResponse } from './objectupdateresponse';
import { HttpErrorResponse } from '@angular/common/http';

describe('StorageService', () => {
  let httpTestingController: HttpTestingController;
  let service: StorageService;
  let PERIOD: Period = {
    id: 'testperiod',
    displayName: 'Test period',
    unit: 'units',
    secondaryUnits: [],
    notesURL: '',
    maxCommittedPercentage: 50,
    people: [],
    buckets: [],
    lastUpdateUUID: '',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService],
      imports: [
        HttpClientTestingModule,
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(StorageService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be able to POST a team', () => {
    const team = new Team('testteam', 'Test team');
    const response = '';
    service.addTeam(team).subscribe(data => expect(data).toEqual(response));

    const req = httpTestingController.expectOne('/api/team/');

    expect(req.request.method).toEqual('POST');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json');
    expect(req.request.body).toEqual(team);

    req.flush(response);
  });

  it('should be able to PUT a team', () => {
    const team = new Team('testteam', 'Test team');
    const response = '';
    service.updateTeam(team).subscribe(data => expect(data).toEqual(response));

    const req = httpTestingController.expectOne('/api/team/testteam');

    expect(req.request.method).toEqual('PUT');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json');
    expect(req.request.body).toEqual(team);

    req.flush(response);
  });

  it('should be able to GET a team', () => {
    const team = new Team('testteam', 'Test team');
    service.getTeam('testteam').subscribe(data => expect(data).toEqual(team));

    const req = httpTestingController.expectOne('/api/team/testteam');

    expect(req.request.method).toEqual('GET');

    req.flush(team);
  });

  it('should be able to GET all teams', () => {
    const teams = [new Team('team1', 'Team 1'), new Team('team2', 'Team 2')];
    service.getTeams().subscribe(data => expect(data).toEqual(teams));

    const req = httpTestingController.expectOne('/api/team/');

    expect(req.request.method).toEqual('GET');

    req.flush(teams);
  });

  it('should be able to POST a period', () => {
    const response: ObjectUpdateResponse = {lastUpdateUUID: 'newuuid'};
    service.addPeriod('testteam', PERIOD).subscribe(data => expect(data).toEqual(response));

    const req = httpTestingController.expectOne('/api/period/testteam/');

    expect(req.request.method).toEqual('POST');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json');
    expect(req.request.body).toEqual(PERIOD);

    req.flush(response);
  });

  it('should be able to PUT a period', () => {
    const response: ObjectUpdateResponse = {lastUpdateUUID: 'newuuid'};
    service.updatePeriod('testteam', PERIOD).subscribe(data => expect(data).toEqual(response));

    const req = httpTestingController.expectOne('/api/period/testteam/testperiod');

    expect(req.request.method).toEqual('PUT');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json');
    expect(req.request.body).toEqual(PERIOD);

    req.flush(response);
  });

  it('should be able to GET a period', () => {
    service.getPeriod('testteam', 'testperiod').subscribe(data => expect(data).toEqual(PERIOD));

    const req = httpTestingController.expectOne('/api/period/testteam/testperiod');

    expect(req.request.method).toEqual('GET');
    
    req.flush(PERIOD);
  });

  it('should be able to GET all periods for a team', () => {
    const periods: Period[] = [1, 2].map(i => { return {
      id: 'p' + i,
      displayName: 'Pd ' + i,
      unit: 'units',
      secondaryUnits: [],
      notesURL: '',
      maxCommittedPercentage: 50,
      people: [],
      buckets: [],
      lastUpdateUUID: '',
    }});
    service.getPeriods('testteam').subscribe(data => expect(data).toEqual(periods));

    const req = httpTestingController.expectOne('/api/period/testteam/');

    expect(req.request.method).toEqual('GET');

    req.flush(periods);
  });

  it('should handle 404 for single period GET', () => {
    const message = '404 message';

    service.getPeriod('testteam', 'testperiod').subscribe(
      data => fail('should have failed with the 404 error'),
      (error: HttpErrorResponse) => {
        expect(error.status).toEqual(404, 'status');
        expect(error.error).toEqual(message, 'message');
      }
    );

    const req = httpTestingController.expectOne('/api/period/testteam/testperiod');

    req.flush(message, {status: 404, statusText: 'Not Found'});
  });
});
