import { Objective } from "./objective";
import { Assignment } from "./assignment";

export class Bucket {
  constructor(
    public displayName: string,
    public allocationPercentage: number,
    public objectives: Objective[],
  ) {}

  resourcesCommitted(): number {
    return this.objectives
        .map(objective => objective.resourcesCommitted())
        .reduce((sum, current) => sum + current, 0);
  }

  assignedObjectives(): Objective[] {
    return this.objectives.filter(objective => objective.assignments);
  }
}