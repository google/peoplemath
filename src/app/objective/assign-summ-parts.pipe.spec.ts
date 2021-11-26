/**
 * Copyright 2021 Google LLC
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

import { ImmutableAssignment } from '../assignment';
import { AssignSummPartsPipe } from './assign-summ-parts.pipe';

describe('AssignSummPartsPipe', () => {
  it('create an instance', () => {
    const pipe = new AssignSummPartsPipe();
    expect(pipe).toBeTruthy();
  });

  it('should handle undefined', () => {
    const pipe = new AssignSummPartsPipe();
    expect(pipe.transform(undefined)).toEqual([]);
  });

  it('should handle empty assignments', () => {
    const pipe = new AssignSummPartsPipe();
    expect(pipe.transform([])).toEqual([]);
  });

  it('should handle non-empty assignments', () => {
    const pipe = new AssignSummPartsPipe();
    const assignments = [
      new ImmutableAssignment({ personId: 'bob', commitment: 1 }),
      new ImmutableAssignment({ personId: 'charlotte', commitment: 2 }),
      new ImmutableAssignment({ personId: 'nobody', commitment: 0 }),
    ];
    expect(pipe.transform(assignments)).toEqual([
      ['bob', 1],
      ['charlotte', 2],
    ]);
  });
});
