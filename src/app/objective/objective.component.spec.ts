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

import { ObjectiveComponent } from './objective.component';
import { FormsModule } from '@angular/forms';
import { CommitmentType, ImmutableObjective } from '../objective';
import { MaterialModule } from '../material/material.module';

describe('ObjectiveComponent', () => {
  let component: ObjectiveComponent;
  let fixture: ComponentFixture<ObjectiveComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ObjectiveComponent,
      ],
      imports: [ FormsModule, MaterialModule ]
,    })
    .compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ObjectiveComponent);
    component = fixture.componentInstance;
    component.objective = ImmutableObjective.fromObjective({
      name: 'test objective',
      resourceEstimate: 6,
      commitmentType: CommitmentType.Aspirational,
      groups: [],
      tags: [],
      notes: '',
      assignments: [
        {personId: 'alice', commitment: 1},
        {personId: 'bob', commitment: 2},
      ],
    });
    component.unit = 'person weeks';
    let unallocatedTime = new Map();
    unallocatedTime.set('alice', -1);  // Temporary over-allocation for alice
    unallocatedTime.set('bob', 0);
    unallocatedTime.set('charlie', 3);
    unallocatedTime.set('dave', 0);
    component.unallocatedTime = unallocatedTime;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate correct assignment data', () => {
    let assignmentData = component.personAssignmentData();
    expect(assignmentData.filter(d => d.username == 'bob')).toEqual([{username: 'bob', available: 2, assign: 2}]);
    expect(assignmentData.filter(d => d.username == 'charlie')).toEqual([{username: 'charlie', available: 3, assign: 0}]);
    expect(assignmentData.filter(d => d.username == 'alice')).toEqual([{username: 'alice', available: 0, assign: 1}]);
    expect(assignmentData.filter(d => d.username == 'dave')).toEqual([]);
  });
});
