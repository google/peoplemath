import { TestBed, inject } from '@angular/core/testing';

import { PersonAvailabilityService } from './person-availability.service';

describe('PersonAvailabilityService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PersonAvailabilityService]
    });
  });

  it('should be created', inject([PersonAvailabilityService], (service: PersonAvailabilityService) => {
    expect(service).toBeTruthy();
  }));
});
