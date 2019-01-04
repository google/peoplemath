import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamsComponent } from './teams.component';
import { RouterTestingModule } from '@angular/router/testing';
import { OkrStorageService } from '../okrstorage.service';
import { MaterialModule } from '../material/material.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TeamsComponent', () => {
  let component: TeamsComponent;
  let fixture: ComponentFixture<TeamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamsComponent ],
      imports: [
        RouterTestingModule,
        MaterialModule,
        HttpClientTestingModule,
      ],
      providers: [
        OkrStorageService,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
