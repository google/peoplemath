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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPeriodDialogComponent, EditPeriodDialogData } from './edit-period-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Period } from '../period';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EditPeriodDialogComponent', () => {
  let component: EditPeriodDialogComponent;
  let fixture: ComponentFixture<EditPeriodDialogComponent>;
  let dialogSpy = jasmine.createSpyObj('MatDialogRef', ['open']);
  let DIALOG_DATA: EditPeriodDialogData = {
    period: {
      id: 'mytest',
      displayName: 'My Test Period',
      unit: 'person weeks',
      notesURL: '',
      maxCommittedPercentage: 0,
      people: [],
      buckets: [],
      lastUpdateUUID: '',
    },
    okAction: 'OK', title: 'My Test Title', allowEditID: false,
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPeriodDialogComponent ],
      imports: [
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
      ],
      providers: [
        {provide: MatDialogRef, useValue: dialogSpy},
        {provide: MAT_DIALOG_DATA, useValue: DIALOG_DATA},
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPeriodDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
