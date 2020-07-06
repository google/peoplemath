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

import { AssignmentsClassifyComponent, AggregateBy } from './assignments-classify.component';
import { MaterialModule } from '../material/material.module';
import { ResourceQuantityComponent } from '../resource-quantity/resource-quantity.component';

describe('AssignmentsClassifyComponent', () => {
  let component: AssignmentsClassifyComponent;
  let fixture: ComponentFixture<AssignmentsClassifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AssignmentsClassifyComponent,
        ResourceQuantityComponent,
      ],
      imports: [
        MaterialModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentsClassifyComponent);
    component = fixture.componentInstance;
    component.aggregateBy = AggregateBy.Group;
    component.period = {
      id: 'test',
      displayName: 'Test Period',
      unit: 'things',
      secondaryUnits: [],
      notesURL: '',
      maxCommittedPercentage: 10,
      buckets: [],
      people: [],
      lastUpdateUUID: '',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
