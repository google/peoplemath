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

import { AddPeriodDialogComponent, AddPeriodDialogData, CreateMethod } from './add-period-dialog.component';
import { MaterialModule } from '../material/material.module';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AddPeriodDialogComponent', () => {
  let component: AddPeriodDialogComponent;
  let fixture: ComponentFixture<AddPeriodDialogComponent>;
  const dialogSpy = jasmine.createSpyObj('MatDialogRef', ['open']);
  const DIALOG_DATA: AddPeriodDialogData = {
    period: {
      id: 'test',
      displayName: 'Test Period',
      unit: 'person weeks',
      secondaryUnits: [],
      notesURL: '',
      maxCommittedPercentage: 0,
      people: [],
      buckets: [],
      lastUpdateUUID: '',
    },
    createMethod: CreateMethod.Blank,
    existingPeriods: [],
    copyFromPeriodID: '',
    copyUnit: false,
    copyPeople: false,
    copyBuckets: false,
    copyObjectives: false,
    copyAssignments: false,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPeriodDialogComponent ],
      imports: [
        MaterialModule,
        FormsModule,
        BrowserAnimationsModule,
      ],
      providers: [
        {provide: MatDialogRef, useValue: dialogSpy},
        {provide: MAT_DIALOG_DATA, useValue: DIALOG_DATA},
      ],
    })
    .compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(AddPeriodDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
