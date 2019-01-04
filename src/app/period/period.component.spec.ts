import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { PeriodComponent } from './period.component';
import { AppRoutingModule } from '../app-routing.module';
import { OkrStorageService } from '../okrstorage.service';
import { FormsModule } from '@angular/forms';
import { BucketComponent } from '../bucket/bucket.component';
import { ObjectiveComponent } from '../objective/objective.component';
import { AssignmentComponent } from '../assignment/assignment.component';
import { PeopleComponent } from '../people/people.component';

describe('PeriodComponent', () => {
  let component: PeriodComponent;
  let fixture: ComponentFixture<PeriodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PeriodComponent,
        BucketComponent,
        ObjectiveComponent,
        AssignmentComponent,
        PeopleComponent,
      ],
      imports: [
        RouterTestingModule,
        FormsModule,
      ],
      providers: [
        OkrStorageService,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
