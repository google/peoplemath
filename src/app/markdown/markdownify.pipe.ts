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

import { Pipe, PipeTransform } from '@angular/core';
import * as DOMPurify from 'dompurify';
import snarkdown from 'snarkdown';

@Pipe({
  name: 'markdownify',
})
export class MarkdownifyPipe implements PipeTransform {
  transform(markdown?: string, mode?: string): string {
    if (markdown === undefined) {
      return '';
    }
    // The use of DOMPurify here is partly as a defence-in-depth against XSS,
    // and partly to disable unwanted parts of Markdown and achieve desired transformations.
    DOMPurify.addHook('afterSanitizeAttributes', (node: Element) => {
      if (node.nodeName.toLowerCase() === 'a') {
        if (mode === 'nolinks') {
          // Replace the link with some inert underlined text
          const el = node.ownerDocument.createElement('u');
          el.innerHTML = node.innerHTML;
          node.parentNode!.replaceChild(el, node);
        } else {
          // Make the link open in a new window
          node.setAttribute('target', '_blank');
          node.setAttribute('rel', 'noopener noreferrer');
        }
      }
    });
    /* eslint-disable @typescript-eslint/naming-convention */
    const result = DOMPurify.sanitize(snarkdown(markdown), {
      ALLOWED_TAGS: ['a', 'em', 'strong', 'code', 's', 'u'],
      KEEP_CONTENT: true,
    });
    /* eslint-enable @typescript-eslint/naming-convention */
    DOMPurify.removeHook('afterSanitizeAttributes');
    return result;
  }
}
