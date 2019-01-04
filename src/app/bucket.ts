import { Objective } from "./objective";

export class Bucket {
    id: string;
    displayName: string;
    allocationPercentage: number;
    objectives?: Objective[] = [];
}