import { TestBed, inject } from '@angular/core/testing';

import { StorageService } from './storage.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('StorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService],
      imports: [
        HttpClientTestingModule,
      ],
    });
  });

  it('should be created', inject([StorageService], (service: StorageService) => {
    expect(service).toBeTruthy();
  }));
});
