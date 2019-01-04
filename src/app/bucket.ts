import { Objective } from "./objective";
import { Assignment } from "./assignment";

export class Bucket {
  constructor(
    public displayName: string,
    public allocationPercentage: number,
    public objectives: Objective[],
  ) {}

  resourcesCommitted(): number {
    return this.allAssignments()
        .map(assignment => assignment.commitment)
        .reduce((sum, current) => sum + current, 0);
  }

  assignedObjectives(): Objective[] {
    return this.objectives.filter(objective => objective.assignments);
  }

  private allAssignments(): Assignment[] {
    return this.assignedObjectives()
        .map(objective => objective.assignments)
        .reduce((prev, current) => prev.concat(current), []);
  }
}