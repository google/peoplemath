import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BucketAllocLimitComponent } from './bucket-alloc-limit.component';
import { AllocationType, ImmutableBucket } from '../bucket';

describe('BucketAllocLimitComponent', () => {
  let component: BucketAllocLimitComponent;
  let fixture: ComponentFixture<BucketAllocLimitComponent>;
  let BUCKET = ImmutableBucket.fromBucket({
    displayName: 'My test bucket',
    allocationType: AllocationType.Percentage,
    allocationPercentage: 60,
    objectives: [],
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BucketAllocLimitComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BucketAllocLimitComponent);
    component = fixture.componentInstance;
    component.bucket = BUCKET;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
