// Copyright 2019-2020 Google LLC
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

import { Bucket, bucketResourcesAllocated } from "./bucket";
import { Person } from "./person";

export interface Period {
  id: string,
  displayName: string,
  unit: string,
  notesURL: string,
  maxCommittedPercentage: number,
  buckets: Bucket[],
  people: Person[],
  lastUpdateUUID: string,
}

/**
 * Total resources for this period which have been allocated to objectives
 */
export function periodResourcesAllocated(period: Period): number {
  return period.buckets
      .map(bucketResourcesAllocated)
      .reduce((sum, prev) => sum + prev, 0);
}
