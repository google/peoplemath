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

import { CsumClassPipe } from './csum-class.pipe';

describe('CsumClassPipe', () => {
  it('create an instance', () => {
    const pipe = new CsumClassPipe();
    expect(pipe).toBeTruthy();
  });

  it('should identify OK cumulative sums', () => {
    const pipe = new CsumClassPipe();
    expect(pipe.transform(10, 100, 10)).toEqual('resource-csum-ok');
  });

  it('should identify marginal cumulative sums', () => {
    const pipe = new CsumClassPipe();
    expect(pipe.transform(10, 9, 8)).toEqual('resource-csum-marginal');
  });

  it('should identify excess cumulative sums', () => {
    const pipe = new CsumClassPipe();
    expect(pipe.transform(100, 10, 1)).toEqual('resource-csum-excess');
  });
});
