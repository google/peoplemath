// Copyright 2019, 2021, 2023, 2025 Google LLC
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

import {
  EditBucketDialogComponent,
  EditBucketDialogData,
} from './edit-bucket-dialog.component';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AllocationType } from '../bucket';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EditBucketDialogComponent', () => {
  let component: EditBucketDialogComponent;
  let fixture: ComponentFixture<EditBucketDialogComponent>;
  const dialogSpy = jasmine.createSpyObj('MatDialogRef', ['open']);
  const DIALOG_DATA: EditBucketDialogData = {
    bucket: {
      displayName: 'My test bucket',
      allocationPercentage: 76,
      allocationType: AllocationType.Percentage,
      allocationAbsolute: 0,
      objectives: [],
    },
    okAction: 'OK',
    title: 'My test dialog',
    unit: 'person weeks',
    balancePct: 20,
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          FormsModule,
          BrowserAnimationsModule,
          EditBucketDialogComponent,
        ],
        providers: [
          { provide: MatDialogRef, useValue: dialogSpy },
          { provide: MAT_DIALOG_DATA, useValue: DIALOG_DATA },
        ],
      }).compileComponents();
    })
  );

  beforeEach(
    waitForAsync(() => {
      fixture = TestBed.createComponent(EditBucketDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should balance allocations', () => {
    expect(component.isAllocationUnbalanced()).toBeTrue();
    component.balanceAllocation();
    expect(component.isAllocationUnbalanced()).toBeFalse();
    expect(component.data.bucket.allocationPercentage).toEqual(20);
  });
});
