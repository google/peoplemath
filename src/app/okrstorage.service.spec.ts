import { TestBed, inject } from '@angular/core/testing';

import { OkrStorageService } from './okrstorage.service';

describe('OkrstorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OkrStorageService]
    });
  });

  it('should be created', inject([OkrStorageService], (service: OkrStorageService) => {
    expect(service).toBeTruthy();
  }));
});
