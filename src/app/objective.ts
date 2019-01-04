import { Assignment } from "./assignment";

export class Objective {
  constructor(
      public name: string,
      public resourceEstimate: number,
      public assignments: Assignment[],
  ) {}

  /**
   * Sum of resources committed to the given objective
   */
  resourcesCommitted(): number {
    return this.assignments
        .map(assignment => assignment.commitment)
        .reduce((sum, current) => sum + current, 0);
  }
}