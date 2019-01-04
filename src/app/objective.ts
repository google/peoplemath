import { Assignment } from "./assignment";

export class Objective {
  constructor(
      public name: string,
      resourceEstimate: number,
      public assignments: Assignment[],
  ) {
    this.resourceEstimate = resourceEstimate;
  }

  private _resourceEstimate: number;

  get resourceEstimate(): number {
    return this._resourceEstimate;
  }

  set resourceEstimate(est: number) {
    this._resourceEstimate = est >= 0 ? est : 0;
  }

  /**
   * Sum of resources committed to the given objective
   */
  resourcesCommitted(): number {
    return this.assignments
        .map(assignment => assignment.commitment)
        .reduce((sum, current) => sum + current, 0);
  }
}