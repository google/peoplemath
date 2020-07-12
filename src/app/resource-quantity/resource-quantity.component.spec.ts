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

import { ResourceQuantityComponent } from './resource-quantity.component';

describe('ResourceQuantityComponent', () => {
  let component: ResourceQuantityComponent;
  let fixture: ComponentFixture<ResourceQuantityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResourceQuantityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceQuantityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render expected text', () => {
    component.quantity = 500;
    component.primaryUnit = 'things';
    fixture.detectChanges();
    let element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toEqual('500 things');

    component.ofQuantity = 1000;
    fixture.detectChanges();
    expect(element.textContent).toEqual('500 of 1000 things');

    component.secondaryUnits = [
      {name: 'millithings', conversionFactor: 0.001},
    ];
    fixture.detectChanges();
    expect(element.textContent).toEqual('500 of 1000 things (0.5 of 1 millithings)');

    component.ofQuantity = undefined;
    fixture.detectChanges();
    expect(element.textContent).toEqual('500 things (0.5 millithings)');

    component.ofQuantity = 1000;
    component.secondaryUnits = component.secondaryUnits.concat([{name: 'centithings', conversionFactor: 0.01}]);
    fixture.detectChanges();
    expect(element.textContent).toEqual('500 of 1000 things (0.5 of 1 millithings, 5 of 10 centithings)');
  });
});
