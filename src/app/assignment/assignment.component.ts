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
import { CommitmentType, ImmutableObjective } from '../objective';

@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.component.html',
  styleUrls: ['./assignment.component.css'],
  // Requires all inputs to be immutable
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentComponent implements OnInit {
  @Input() objective?: ImmutableObjective;
  @Input() assignedResources?: number;
  @Input() unit?: string;

  constructor() { }

  ngOnInit(): void {
  }

  isCommitted(): boolean {
    return this.objective?.commitmentType === CommitmentType.Committed;
  }
}
