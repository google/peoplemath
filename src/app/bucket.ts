import { Objective, objectiveResourcesCommitted } from "./objective";

export class Bucket {
  constructor(
    public displayName: string,
    public allocationPercentage: number,
    public objectives: Objective[],
  ) {}
};

/**
 * Sum of resources committed to the bucket.
 * Not a member function to avoid problems with JSON (de)serialization.
 */
export function bucketResourcesCommitted(bucket: Bucket): number {
  return bucket.objectives
    .map(objectiveResourcesCommitted)
    .reduce((sum, current) => sum + current, 0);
}

