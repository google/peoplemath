/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentComponent } from './assignment.component';
import { MaterialModule } from '../material/material.module';
import { CommitmentType, ImmutableObjective } from '../objective';

describe('AssignmentComponent', () => {
  let component: AssignmentComponent;
  let fixture: ComponentFixture<AssignmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignmentComponent ],
      imports: [
        MaterialModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentComponent);
    component = fixture.componentInstance;
    component.objective = ImmutableObjective.fromObjective({
      name: 'Thing',
      resourceEstimate: 3,
      commitmentType: CommitmentType.Aspirational,
      groups: [],
      tags: [],
      notes: '',
      assignments: [
        {commitment: 5, personId: 'alice'},
      ],
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
