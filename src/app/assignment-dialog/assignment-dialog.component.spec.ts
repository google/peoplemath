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

import { AssignmentDialogComponent, AssignmentDialogData } from './assignment-dialog.component';
import { MaterialModule } from '../material/material.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommitmentType } from '../objective';

describe('AssignmentDialogComponent', () => {
  let component: AssignmentDialogComponent;
  let fixture: ComponentFixture<AssignmentDialogComponent>;
  const dialogSpy = jasmine.createSpyObj('MatDialogRef', ['open']);
  const DIALOG_DATA: AssignmentDialogData = {
    objective: {
      name: 'My Test Objective',
      resourceEstimate: 10,
      commitmentType: CommitmentType.Aspirational,
      groups: [],
      tags: [],
      notes: '',
      assignments: [],
    },
    people: [],
    unit: 'person weeks',
    columns: [],
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignmentDialogComponent ],
      imports: [
        MaterialModule,
      ],
      providers: [
        {provide: MatDialogRef, useValue: dialogSpy},
        {provide: MAT_DIALOG_DATA, useValue: DIALOG_DATA},
      ]
    })
    .compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(AssignmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
