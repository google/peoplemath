import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamPeriodsComponent } from './teamperiods.component';
import { RouterTestingModule } from '@angular/router/testing';
import { StorageService } from '../storage.service';
import { MaterialModule } from '../material/material.module';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Team } from '../team';
import { of } from 'rxjs';

describe('TeamPeriodsComponent', () => {
  let component: TeamPeriodsComponent;
  let fixture: ComponentFixture<TeamPeriodsComponent>;
  let storageServiceSpy = jasmine.createSpyObj('StorageService', ['getTeam', 'getPeriods']);
  let TEST_TEAM = new Team('testTeam', 'My test team');

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamPeriodsComponent ],
      imports: [ RouterTestingModule, MaterialModule ],
      providers: [
        {provide: StorageService, useValue: storageServiceSpy},
        {provide: ActivatedRoute, useValue: {snapshot: {paramMap: convertToParamMap({'team': TEST_TEAM.id})}}},
      ],
    })
    .compileComponents();
    storageServiceSpy.getTeam.and.returnValue(of(TEST_TEAM));
    storageServiceSpy.getPeriods.and.returnValue(of([]));
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamPeriodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
