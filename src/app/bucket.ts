import { Objective } from "./objective";

export class Bucket {
    displayName: string;
    allocationPercentage: number;
    objectives?: Objective[] = [];
}