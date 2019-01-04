import { TestBed, inject } from '@angular/core/testing';

import { OkrStorageService } from './okrstorage.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('OkrstorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OkrStorageService],
      imports: [
        HttpClientTestingModule,
      ],
    });
  });

  it('should be created', inject([OkrStorageService], (service: OkrStorageService) => {
    expect(service).toBeTruthy();
  }));
});
