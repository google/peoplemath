import { Assignment } from "./assignment";

export class Objective {
    name: string;
    resourceEstimate: number;
    assignments?: Assignment[];
}