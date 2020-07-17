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

import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { SecondaryUnit, ImmutableSecondaryUnit } from '../period';

@Component({
  selector: 'app-resource-quantity',
  templateUrl: './resource-quantity.component.html',
  styleUrls: ['./resource-quantity.component.css'],
  // Requires all inputs to be immutable
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceQuantityComponent implements OnInit {
  @Input() quantity?: number;
  @Input() ofQuantity?: number;
  @Input() primaryUnit?: string;
  @Input() secondaryUnits?: readonly ImmutableSecondaryUnit[];

  constructor() { }

  ngOnInit(): void {
  }

  quantityIn(quantity: number, unit: SecondaryUnit): number {
    return quantity * unit.conversionFactor;
  }
}
