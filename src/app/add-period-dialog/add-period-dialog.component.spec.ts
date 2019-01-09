import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPeriodDialogComponent, AddPeriodDialogData, CreateMethod } from './add-period-dialog.component';
import { MaterialModule } from '../material/material.module';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Period } from '../period';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AddPeriodDialogComponent', () => {
  let component: AddPeriodDialogComponent;
  let fixture: ComponentFixture<AddPeriodDialogComponent>;
  let dialogSpy = jasmine.createSpyObj('MatDialogRef', ['open']);
  let DIALOG_DATA: AddPeriodDialogData = {
    period: new Period('test', 'Test Period', 'person weeks', [], [], ''),
    createMethod: CreateMethod.Blank,
    existingPeriods: [],
    copyFromPeriodID: '',
    copyUnit: false,
    copyPeople: false,
    copyBuckets: false,
    copyObjectives: false,
    copyAssignments: false,
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPeriodDialogComponent ],
      imports: [
        MaterialModule,
        FormsModule,
        BrowserAnimationsModule,
      ],
      providers: [
        {provide: MatDialogRef, useValue: dialogSpy},
        {provide: MAT_DIALOG_DATA, useValue: DIALOG_DATA},
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPeriodDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
