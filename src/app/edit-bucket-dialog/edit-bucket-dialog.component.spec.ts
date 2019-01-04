import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBucketDialogComponent, EditBucketDialogData } from './edit-bucket-dialog.component';
import { MaterialModule } from '../material/material.module';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Bucket } from '../bucket';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EditBucketDialogComponent', () => {
  let component: EditBucketDialogComponent;
  let fixture: ComponentFixture<EditBucketDialogComponent>;
  let dialogSpy = jasmine.createSpyObj('MatDialogRef', ['open']);
  let DIALOG_DATA: EditBucketDialogData = {
    bucket: new Bucket('My test bucket', 76, []),
    okAction: 'OK',
    allowCancel: true,
    title: 'My test dialog',
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditBucketDialogComponent ],
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
    fixture = TestBed.createComponent(EditBucketDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
