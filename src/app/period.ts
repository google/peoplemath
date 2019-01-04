import { Bucket } from "./bucket";
import { Person } from "./person";

export class Period {
    id: string;
    displayName: string;
    unit?: string = 'person weeks';
    buckets?: Bucket[] = [];
    people?: Person[] = [];
}