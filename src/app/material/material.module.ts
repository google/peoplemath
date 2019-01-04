import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule, MatToolbarModule, MatSidenavModule, MatCardModule,
         MatFormFieldModule, MatButtonModule, MatTableModule, MatDialogModule,
         MatInputModule } from '@angular/material';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatSidenavModule,
    MatTableModule,
    MatToolbarModule
  ],
  exports: [
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatSidenavModule,
    MatTableModule,
    MatToolbarModule
  ]
})
export class MaterialModule { }
