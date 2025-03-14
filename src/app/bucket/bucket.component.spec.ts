// Copyright 2019-2021, 2023 Google LLC
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

import { BucketComponent } from './bucket.component';
import { FormsModule } from '@angular/forms';
import { AllocationType, ImmutableBucket } from '../bucket';
import { ObjectiveComponent } from '../objective/objective.component';
import { DisplayObjectivesPipe } from './displayobjectives.pipe';
import { BucketAllocLimitComponent } from '../bucket-alloc-limit/bucket-alloc-limit.component';

describe('BucketComponent', () => {
  let component: BucketComponent;
  let fixture: ComponentFixture<BucketComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          FormsModule,
          BucketComponent,
          ObjectiveComponent,
          BucketAllocLimitComponent,
          DisplayObjectivesPipe,
        ],
        providers: [],
      }).compileComponents();
    })
  );

  beforeEach(
    waitForAsync(() => {
      fixture = TestBed.createComponent(BucketComponent);
      component = fixture.componentInstance;
      component.bucket = ImmutableBucket.fromBucket({
        displayName: 'test bucket',
        allocationType: AllocationType.Percentage,
        allocationPercentage: 100,
        allocationAbsolute: 0,
        objectives: [],
      });
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
