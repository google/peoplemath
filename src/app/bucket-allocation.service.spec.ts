import { TestBed, inject } from '@angular/core/testing';

import { BucketAllocationService } from './bucket-allocation.service';

describe('BucketAllocationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BucketAllocationService]
    });
  });

  it('should be created', inject([BucketAllocationService], (service: BucketAllocationService) => {
    expect(service).toBeTruthy();
  }));
});
