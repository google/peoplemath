import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { PeriodComponent } from './period.component';
import { AppRoutingModule } from '../app-routing.module';
import { OkrStorageService } from '../okrstorage.service';

describe('PeriodComponent', () => {
  let component: PeriodComponent;
  let fixture: ComponentFixture<PeriodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeriodComponent ],
      imports: [ RouterTestingModule ],
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
