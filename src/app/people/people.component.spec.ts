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

import { PeopleComponent } from './people.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ImmutablePerson } from '../person';

describe('PeopleComponent', () => {
  let component: PeopleComponent;
  let fixture: ComponentFixture<PeopleComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PeopleComponent],
        imports: [FormsModule, MaterialModule, BrowserAnimationsModule],
      }).compileComponents();
    })
  );

  beforeEach(
    waitForAsync(() => {
      fixture = TestBed.createComponent(PeopleComponent);
      component = fixture.componentInstance;
      component.people = [
        {
          id: 'p1',
          displayName: 'Person 1',
          location: 'ABC',
          availability: 6,
        },
        {
          id: 'p2',
          displayName: 'Person 2',
          location: 'DEF',
          availability: 5,
        },
        {
          id: 'p3',
          displayName: 'Person 3',
          location: 'GHI',
          availability: 6,
        },
      ].map((p) => new ImmutablePerson(p));
      component.peopleAllocations = new Map();
      component.peopleAssignmentCounts = new Map();
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate default availability correctly', () => {
    expect(component.defaultPersonAvailability()).toEqual(6);
  });
});
