import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPeriodDialogComponent, EditPeriodDialogData } from './edit-period-dialog.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Period } from '../period';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EditPeriodDialogComponent', () => {
  let component: EditPeriodDialogComponent;
  let fixture: ComponentFixture<EditPeriodDialogComponent>;
  let dialogSpy = jasmine.createSpyObj('MatDialogRef', ['open']);
  let DIALOG_DATA: EditPeriodDialogData = {
    period: new Period('mytest', 'My Test Period', 'person weeks', [], [], ''),
    okAction: 'OK', allowCancel: true, title: 'My Test Title', allowEditID: false,
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPeriodDialogComponent ],
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
    fixture = TestBed.createComponent(EditPeriodDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
