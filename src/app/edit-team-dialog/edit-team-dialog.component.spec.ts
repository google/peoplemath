import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTeamDialogComponent, EditTeamDialogData } from './edit-team-dialog.component';
import { MaterialModule } from '../material/material.module';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Team } from '../team';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EditTeamDialogComponent', () => {
  let component: EditTeamDialogComponent;
  let fixture: ComponentFixture<EditTeamDialogComponent>;
  let dialogSpy = jasmine.createSpyObj('MatDialogRef', ['open']);
  let DIALOG_DATA: EditTeamDialogData = {
    team: new Team('test', 'My test team'),
    title: 'My test title',
    okAction: 'OK',
    allowCancel: true,
    allowEditID: false,
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTeamDialogComponent ],
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
    fixture = TestBed.createComponent(EditTeamDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
