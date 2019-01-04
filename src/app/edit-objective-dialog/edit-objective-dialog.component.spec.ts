import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditObjectiveDialogComponent, EditObjectiveDialogData } from './edit-objective-dialog.component';
import { MaterialModule } from '../material/material.module';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Objective } from '../objective';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EditObjectiveDialogComponent', () => {
  let component: EditObjectiveDialogComponent;
  let fixture: ComponentFixture<EditObjectiveDialogComponent>;
  let dialogSpy = jasmine.createSpyObj('MatDialogRef', ['open']);
  let DIALOG_DATA: EditObjectiveDialogData = {
    'objective': new Objective('My test objective', 17, []),
    'title': 'My test dialog',
    'okAction': 'OK',
    'allowCancel': true,
    'unit': 'person weeks',
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditObjectiveDialogComponent ],
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
    fixture = TestBed.createComponent(EditObjectiveDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
