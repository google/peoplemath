import { Assignment } from "./assignment";

export class Objective {
  constructor(
      public name: string,
      public resourceEstimate: number,
      public assignments: Assignment[],
  ) {}
}

/**
 * Sum of resources committed to the given objective.
 * Not a member function to avoid problems with (de)serialization.
 */
export function objectiveResourcesCommitted(objective: Objective): number {
  return objective.assignments
    .map(assignment => assignment.commitment)
    .reduce((sum, current) => sum + current, 0);
}