import { Objective } from "./objective";

export class Bucket {
    id: string;
    displayName: string;
    percentage: number;
    objectives?: Objective[] = [];
}