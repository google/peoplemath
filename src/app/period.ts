import { Bucket } from "./bucket";
import { Person } from "./person";

export class Period {
  constructor(
    public id: string,
    public displayName: string,
    public unit: string = 'person weeks',
    public buckets: Bucket[] = [],
    public people: Person[] = [],
  ) {}

  /**
   * Amount of the given person's resources committed to objectives during this period.
   */
  personCommitted(person: Person): number {
    let result: number = 0;
    this.buckets.forEach(bucket => {
        bucket.objectives.forEach(objective => {
            objective.assignments
                .filter(assignment => assignment.personId === person.id)
                .forEach(assignment => result += assignment.commitment);
        })
    });
    return result;
  }
}