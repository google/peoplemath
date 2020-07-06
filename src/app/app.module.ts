// Copyright 2019-2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LayoutModule } from '@angular/cdk/layout';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './/app-routing.module';
import { TeamsComponent } from './teams/teams.component';
import { TeamPeriodsComponent } from './teamperiods/teamperiods.component';
import { PeriodComponent } from './period/period.component';
import { StorageService } from './storage.service';
import { BucketComponent } from './bucket/bucket.component';
import { ObjectiveComponent } from './objective/objective.component';
import { PeopleComponent, EditPersonDialog } from './people/people.component';
import { AssignmentsByPersonComponent } from './assignments-by-person/assignments-by-person.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { AssignmentDialogComponent } from './assignment-dialog/assignment-dialog.component';
import { EditObjectiveDialogComponent } from './edit-objective-dialog/edit-objective-dialog.component';
import { EditBucketDialogComponent } from './edit-bucket-dialog/edit-bucket-dialog.component';
import { EditPeriodDialogComponent } from './edit-period-dialog/edit-period-dialog.component';
import { EditTeamDialogComponent } from './edit-team-dialog/edit-team-dialog.component';
import { HttpClientModule } from '@angular/common/http';
import { AddPeriodDialogComponent } from './add-period-dialog/add-period-dialog.component';
import { PeriodSummaryComponent } from './period-summary/period-summary.component';
import { ObjectiveSummaryComponent } from './objective-summary/objective-summary.component';
import { AssignmentsClassifyComponent } from './assignments-classify/assignments-classify.component';
import { AssignmentComponent } from './assignment/assignment.component';
import { BucketSummaryComponent } from './bucket-summary/bucket-summary.component';
import { GroupSummaryComponent } from './group-summary/group-summary.component';
import { TagSummaryComponent } from './tag-summary/tag-summary.component';
import { ResourceQuantityComponent } from './resource-quantity/resource-quantity.component';
import { RenameClassDialog } from './rename-class-dialog/rename-class-dialog.component';
import { PillComponent } from './pill/pill.component';


@NgModule({
  declarations: [
    AppComponent,
    TeamsComponent,
    TeamPeriodsComponent,
    PeriodComponent,
    BucketComponent,
    ObjectiveComponent,
    PeopleComponent,
    EditPersonDialog,
    AssignmentsByPersonComponent,
    AssignmentDialogComponent,
    EditObjectiveDialogComponent,
    EditBucketDialogComponent,
    EditPeriodDialogComponent,
    EditTeamDialogComponent,
    AddPeriodDialogComponent,
    PeriodSummaryComponent,
    ObjectiveSummaryComponent,
    AssignmentsClassifyComponent,
    AssignmentComponent,
    BucketSummaryComponent,
    GroupSummaryComponent,
    TagSummaryComponent,
    ResourceQuantityComponent,
    RenameClassDialog,
    PillComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    LayoutModule,
    MaterialModule,
    FlexLayoutModule,
    HttpClientModule,
  ],
  providers: [
    StorageService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
