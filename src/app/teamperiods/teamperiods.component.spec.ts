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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TeamPeriodsComponent } from './teamperiods.component';
import { RouterTestingModule } from '@angular/router/testing';
import { StorageService } from '../storage.service';
import { MaterialModule } from '../material/material.module';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Team } from '../team';
import { of } from 'rxjs';
import {Person} from '../person';
import {AngularFireModule} from '@angular/fire';
import {firebaseConfig} from '../../environments/firebaseConfig';
import {AngularFireAuthModule} from '@angular/fire/auth';

describe('TeamPeriodsComponent', () => {
  let component: TeamPeriodsComponent;
  let fixture: ComponentFixture<TeamPeriodsComponent>;
  const storageServiceSpy = jasmine.createSpyObj('StorageService', ['getTeam', 'getPeriods']);
  const TEST_TEAM = new Team('testTeam', 'My test team');

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamPeriodsComponent ],
      imports: [
        RouterTestingModule,
        MaterialModule,
        AngularFireModule.initializeApp(firebaseConfig.firebase, 'firebaseApp'),
        AngularFireAuthModule,
      ],
      providers: [
        {provide: StorageService, useValue: storageServiceSpy},
        {provide: ActivatedRoute, useValue: {paramMap: of(convertToParamMap({team: TEST_TEAM.id}))}},
      ],
    })
    .compileComponents();
    storageServiceSpy.getTeam.and.returnValue(of(TEST_TEAM));
    storageServiceSpy.getPeriods.and.returnValue(of([]));
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(TeamPeriodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should copy people list correctly', () => {
    const people = [new Person('alice', 'Alice Atkins', 'LON', 5),
      new Person('peter', 'Peter Parker', 'USA', 10)];
    expect(component.copyPeople(people)).toEqual(people);
  });
});
