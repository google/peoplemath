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

import { MarkdownifyPipe } from './markdownify.pipe';

describe('MarkdownifyPipe', () => {
  it('create an instance', () => {
    const pipe = new MarkdownifyPipe();
    expect(pipe).toBeTruthy();
  });

  it('should leave plain text unchanged', () => {
    const pipe = new MarkdownifyPipe();
    expect(pipe.transform('some plain text')).toEqual('some plain text');
  });

  it('should support bold', () => {
    const pipe = new MarkdownifyPipe();
    expect(pipe.transform('**some bold**')).toEqual(
      '<strong>some bold</strong>'
    );
  });

  it('should support italics', () => {
    const pipe = new MarkdownifyPipe();
    expect(pipe.transform('*some italic*')).toEqual('<em>some italic</em>');
  });

  it('should support code', () => {
    const pipe = new MarkdownifyPipe();
    expect(pipe.transform('`some code`')).toEqual('<code>some code</code>');
  });

  it('should support links', () => {
    const pipe = new MarkdownifyPipe();
    expect(pipe.transform('[a link](http://thetarget/)')).toEqual(
      '<a href="http://thetarget/" target="_blank" rel="noopener noreferrer">a link</a>'
    );
  });

  it('should underline links in nolinks mode', () => {
    const pipe = new MarkdownifyPipe();
    expect(pipe.transform('[a link](http://thetarget/)', 'nolinks')).toEqual(
      '<u>a link</u>'
    );
  });
});
