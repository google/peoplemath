import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodSummaryComponent } from './period-summary.component';
import { MaterialModule } from '../material/material.module';
import { StorageService } from '../storage.service';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Team } from '../team';
import { Period } from '../period';
import { ObjectiveSummaryComponent } from '../objective-summary/objective-summary.component';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

let TEST_TEAM = new Team('', '');
let TEST_PERIOD = new Period('', '', '', '', 0, [], [], '');
let storageServiceSpy = jasmine.createSpyObj('StorageService', ['getTeam', 'getPeriod']);

describe('PeriodSummaryComponent', () => {
  let component: PeriodSummaryComponent;
  let fixture: ComponentFixture<PeriodSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PeriodSummaryComponent,
        ObjectiveSummaryComponent,
      ],
      imports: [
        RouterTestingModule,
        MaterialModule,
      ],
      providers: [
        {provide: StorageService, useValue: storageServiceSpy},
        {provide: ActivatedRoute, useValue: {
          'snapshot': {'paramMap': convertToParamMap({'team': TEST_TEAM.id, 'period': TEST_PERIOD.id})}},
        },
      ],
    })
    .compileComponents();
    storageServiceSpy.getTeam.and.returnValue(of(TEST_TEAM));
    storageServiceSpy.getPeriod.and.returnValue(of(TEST_PERIOD));
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
