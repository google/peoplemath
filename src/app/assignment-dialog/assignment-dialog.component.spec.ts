import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentDialogComponent, AssignmentDialogData } from './assignment-dialog.component';
import { MaterialModule } from '../material/material.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Objective } from '../objective';

describe('AssignmentDialogComponent', () => {
  let component: AssignmentDialogComponent;
  let fixture: ComponentFixture<AssignmentDialogComponent>;
  let dialogSpy = jasmine.createSpyObj('MatDialogRef', ['open']);
  let DIALOG_DATA: AssignmentDialogData = {
    'objective': new Objective('My Test Objective', 10, []),
    'people': [],
    'unit': 'person weeks',
    'columns': [],
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignmentDialogComponent ],
      imports: [
        MaterialModule,
      ],
      providers: [
        {provide: MatDialogRef, useValue: dialogSpy},
        {provide: MAT_DIALOG_DATA, useValue: DIALOG_DATA},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
