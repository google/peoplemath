import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BucketComponent } from './bucket.component';
import { FormsModule } from '@angular/forms';
import { Bucket } from '../bucket';
import { ObjectiveComponent } from '../objective/objective.component';
import { MaterialModule } from '../material/material.module';

describe('BucketComponent', () => {
  let component: BucketComponent;
  let fixture: ComponentFixture<BucketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        BucketComponent,
        ObjectiveComponent,
      ],
      imports: [ FormsModule, MaterialModule ],
      providers: [
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BucketComponent);
    component = fixture.componentInstance;
    component.bucket = new Bucket('test bucket', 100, []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
