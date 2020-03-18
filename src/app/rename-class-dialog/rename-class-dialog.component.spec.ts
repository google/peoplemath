import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RenameClassDialog, RenameClassDialogData } from './rename-class-dialog.component';
import { MaterialModule } from '../material/material.module';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('RenameClassDialog', () => {
  let component: RenameClassDialog;
  let fixture: ComponentFixture<RenameClassDialog>;
  let dialogSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
  let DIALOG_DATA: RenameClassDialogData = {classType: 'group', currentName: 'thing'};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RenameClassDialog ],
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
    fixture = TestBed.createComponent(RenameClassDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
