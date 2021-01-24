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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TagSummaryComponent } from './tag-summary.component';
import { Period, ImmutablePeriod } from '../period';
import { MaterialModule } from '../material/material.module';
import { ResourceQuantityComponent } from '../resource-quantity/resource-quantity.component';

describe('TagSummaryComponent', () => {
  let component: TagSummaryComponent;
  let fixture: ComponentFixture<TagSummaryComponent>;
  const PERIOD: Period = {
    id: 'p',
    displayName: 'Period',
    maxCommittedPercentage: 50,
    unit: 'things',
    secondaryUnits: [],
    notesURL: '',
    buckets: [],
    people: [],
    lastUpdateUUID: '',
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        TagSummaryComponent,
        ResourceQuantityComponent,
      ],
      imports: [
        MaterialModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(TagSummaryComponent);
    component = fixture.componentInstance;
    component.period = ImmutablePeriod.fromPeriod(PERIOD);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
