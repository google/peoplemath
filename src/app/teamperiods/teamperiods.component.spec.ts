// Copyright 2019-2021 Google LLC
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
import { Person } from '../person';
import { AngularFireModule } from '@angular/fire/compat';
import { firebaseConfig } from '../../environments/firebaseConfig';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';
import {
  AddPeriodDialogComponent,
  AddPeriodDialogData,
  CreateMethod,
} from '../add-period-dialog/add-period-dialog.component';
import { ImmutablePeriod, ImmutableSecondaryUnit, Period } from '../period';
import { ObjectUpdateResponse } from '../objectupdateresponse';

// Class to mimic the MatDialog and apply user actions to the dialog data
class MockDialog {
  editor?: (d: AddPeriodDialogData) => void;

  open(
    component: ComponentType<AddPeriodDialogComponent>,
    config?: MatDialogConfig<AddPeriodDialogData>
  ) {
    return {
      afterClosed: () => {
        const data = config!.data;
        if (this.editor && data) {
          this.editor(data);
        }
        return of(data);
      },
    };
  }
}

describe('TeamPeriodsComponent', () => {
  let component: TeamPeriodsComponent;
  let fixture: ComponentFixture<TeamPeriodsComponent>;
  const storageServiceSpy = jasmine.createSpyObj('StorageService', [
    'getTeam',
    'getPeriods',
    'addPeriod',
  ]);
  const dialogMock = new MockDialog();
  const TEST_TEAM = new Team('testTeam', 'My test team');

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TeamPeriodsComponent],
        imports: [
          RouterTestingModule,
          MaterialModule,
          AngularFireModule.initializeApp(
            firebaseConfig.firebase,
            'firebaseApp'
          ),
          AngularFireAuthModule,
        ],
        providers: [
          { provide: StorageService, useValue: storageServiceSpy },
          {
            provide: ActivatedRoute,
            useValue: {
              paramMap: of(convertToParamMap({ team: TEST_TEAM.id })),
            },
          },
          { provide: MatDialog, useValue: dialogMock },
        ],
      }).compileComponents();
      storageServiceSpy.getTeam.and.returnValue(of(TEST_TEAM));
      storageServiceSpy.getPeriods.and.returnValue(of([]));
    })
  );

  beforeEach(
    waitForAsync(() => {
      fixture = TestBed.createComponent(TeamPeriodsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should copy people list correctly', () => {
    const people = [
      new Person('alice', 'Alice Atkins', 'LON', 5),
      new Person('peter', 'Peter Parker', 'USA', 10),
    ];
    expect(component.copyPeople(people)).toEqual(people);
  });

  it('should copy secondary units correctly', () => {
    const sourcePeriodID = 'sourceID';
    component.periods = [
      ImmutablePeriod.fromPeriod({
        id: sourcePeriodID,
        displayName: 'Source period',
        unit: 'things',
        secondaryUnits: [
          new ImmutableSecondaryUnit({
            name: 'semithings',
            conversionFactor: 2,
          }),
        ],
        notesURL: '',
        maxCommittedPercentage: 50,
        buckets: [],
        people: [],
        lastUpdateUUID: '',
      }),
    ];
    const newPeriod: Period = {
      id: 'new',
      displayName: 'My copied period',
      unit: '',
      secondaryUnits: [],
      maxCommittedPercentage: -1,
      notesURL: '',
      buckets: [],
      people: [],
      lastUpdateUUID: '',
    };
    dialogMock.editor = (data) => {
      data.period = newPeriod;
      data.createMethod = CreateMethod.Copy;
      data.copyFromPeriodID = 'sourceID';
      data.copyUnit = true;
      data.copyPeople = false;
      data.copyBuckets = false;
      data.copyObjectives = false;
      data.copyAssignments = false;
    };
    storageServiceSpy.getPeriods.and.returnValue(of([])); // Not a realistic value, but it doesn't matter
    const resp: ObjectUpdateResponse = {
      lastUpdateUUID: 'foo',
    };
    storageServiceSpy.addPeriod.and.returnValue(of(resp));
    component.addPeriod();
    const expectedPeriod: Period = {
      ...newPeriod,
      unit: 'things',
      maxCommittedPercentage: 50,
      secondaryUnits: [{ name: 'semithings', conversionFactor: 2 }],
      lastUpdateUUID: 'foo', // By the time we do the comparison, this will have been set
    };
    expect(storageServiceSpy.addPeriod).toHaveBeenCalledOnceWith(
      TEST_TEAM.id,
      expectedPeriod
    );
  });
});
