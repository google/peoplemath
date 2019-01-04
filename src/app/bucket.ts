import { Objective } from "./objective";

export class Bucket {
  constructor(
    public displayName: string,
    allocationPercentage: number,
    public objectives: Objective[],
  ) {
    this.allocationPercentage = allocationPercentage;
  }

  private _allocationPercentage: number;

  get allocationPercentage(): number {
    return this._allocationPercentage;
  }

  set allocationPercentage(pct: number) {
    this._allocationPercentage = pct >= 0 ? pct : 0;
  }

  resourcesCommitted(): number {
    return this.objectives
        .map(objective => objective.resourcesCommitted())
        .reduce((sum, current) => sum + current, 0);
  }

  assignedObjectives(): Objective[] {
    return this.objectives.filter(objective => objective.assignments);
  }
}