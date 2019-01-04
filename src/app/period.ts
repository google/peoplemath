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
}