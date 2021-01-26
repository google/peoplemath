import { DisplayObjectivesPipe } from './displayobjectives.pipe';
import { Objective } from '../objective';
import { Bucket, ImmutableBucket } from '../bucket';


const DEFAULT_OBJECTIVES: Objective[] = [
  { name: "max", resourceEstimate: 10, notes: "", groups: [], tags: [], assignments: []},
  { name: "john", resourceEstimate: 20, notes: "", groups: [], tags: [], assignments: []}
];

let bucket = ImmutableBucket.fromBucket(new Bucket('test bucket', 100, DEFAULT_OBJECTIVES)); 

describe('DisplayobjectivesPipe', () => {
  it('should calculate the cumulative sum', () => {
    const pipe = new DisplayObjectivesPipe();
    let displayObjectives = pipe.transform(bucket);
    
    expect(displayObjectives[0].cumulativeSum).toBe(10)
    expect(displayObjectives[1].cumulativeSum).toBe(30)
    
  });
});
