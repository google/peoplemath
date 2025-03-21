/**
 * Copyright 2020-2021, 2023, 2025 Google LLC
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

import { ResourceQuantityComponent } from './resource-quantity.component';
import { ImmutableSecondaryUnit } from '../period';

describe('ResourceQuantityComponent', () => {
  let component: ResourceQuantityComponent;
  let fixture: ComponentFixture<ResourceQuantityComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [ResourceQuantityComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceQuantityComponent);
    component = fixture.componentInstance;
    component.quantity = 500;
    component.primaryUnit = 'things';
    // Do NOT call fixture.detectChanges() here.
    // With OnPush, only one such call has the desired effect per test:
    // https://github.com/angular/angular/issues/12313
  });

  it(
    'should create',
    waitForAsync(() => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    })
  );

  it(
    'should render primary unit',
    waitForAsync(() => {
      fixture.detectChanges();
      const element: HTMLElement = fixture.nativeElement;
      expect(element.textContent).toEqual('500 things');
    })
  );

  it(
    'should render ofQuantity',
    waitForAsync(() => {
      component.ofQuantity = 1000;
      fixture.detectChanges();
      const element: HTMLElement = fixture.nativeElement;
      expect(element.textContent).toEqual('500 of 1000 things');
    })
  );

  it(
    'should render single secondaryUnit with ofQuantity',
    waitForAsync(() => {
      component.ofQuantity = 1000;
      component.secondaryUnits = [
        new ImmutableSecondaryUnit({
          name: 'millithings',
          conversionFactor: 0.001,
        }),
      ];
      fixture.detectChanges();
      const element: HTMLElement = fixture.nativeElement;
      expect(element.textContent).toEqual(
        '500 of 1000 things (0.5 of 1 millithings)'
      );
    })
  );

  it(
    'should render single secondaryUnit without ofQuantity',
    waitForAsync(() => {
      component.secondaryUnits = [
        new ImmutableSecondaryUnit({
          name: 'millithings',
          conversionFactor: 0.001,
        }),
      ];
      fixture.detectChanges();
      const element: HTMLElement = fixture.nativeElement;
      expect(element.textContent).toEqual('500 things (0.5 millithings)');
    })
  );

  it(
    'should render multiple secondaryUnits',
    waitForAsync(() => {
      component.ofQuantity = 1000;
      component.secondaryUnits = [
        new ImmutableSecondaryUnit({
          name: 'millithings',
          conversionFactor: 0.001,
        }),
        new ImmutableSecondaryUnit({
          name: 'centithings',
          conversionFactor: 0.01,
        }),
      ];
      fixture.detectChanges();
      const element: HTMLElement = fixture.nativeElement;
      expect(element.textContent).toEqual(
        '500 of 1000 things (0.5 of 1 millithings, 5 of 10 centithings)'
      );
    })
  );

  it('should render percentages', () => {
    component.fraction = 0.15;
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toEqual('500 things → 15%');
  });

  it('should render percentages with secondary units', () => {
    component.fraction = 0.15;
    component.secondaryUnits = [
      new ImmutableSecondaryUnit({
        name: 'millithings',
        conversionFactor: 1000,
      }),
    ];
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toEqual(
      '500 things (500,000 millithings) → 15%'
    );
  });
});
