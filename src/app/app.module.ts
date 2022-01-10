// Copyright 2019-2022 Google LLC
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

import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LayoutModule } from '@angular/cdk/layout';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { TeamsComponent } from './teams/teams.component';
import { TeamPeriodsComponent } from './teamperiods/teamperiods.component';
import { PeriodComponent } from './period/period.component';
import { StorageService } from './storage.service';
import { BucketComponent } from './bucket/bucket.component';
import { ObjectiveComponent } from './objective/objective.component';
import {
  PeopleComponent,
  EditPersonDialogComponent,
} from './people/people.component';
import { AssignmentsByPersonComponent } from './assignments-by-person/assignments-by-person.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { AssignmentDialogComponent } from './assignment-dialog/assignment-dialog.component';
import { EditObjectiveDialogComponent } from './edit-objective-dialog/edit-objective-dialog.component';
import { EditBucketDialogComponent } from './edit-bucket-dialog/edit-bucket-dialog.component';
import { EditPeriodDialogComponent } from './edit-period-dialog/edit-period-dialog.component';
import { EditTeamDialogComponent } from './edit-team-dialog/edit-team-dialog.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AddPeriodDialogComponent } from './add-period-dialog/add-period-dialog.component';
import { PeriodSummaryComponent } from './period-summary/period-summary.component';
import { ObjectiveSummaryComponent } from './objective-summary/objective-summary.component';
import { AssignmentsClassifyComponent } from './assignments-classify/assignments-classify.component';
import { AssignmentComponent } from './assignment/assignment.component';
import { BucketSummaryComponent } from './bucket-summary/bucket-summary.component';
import { GroupSummaryComponent } from './group-summary/group-summary.component';
import { TagSummaryComponent } from './tag-summary/tag-summary.component';
import { ResourceQuantityComponent } from './resource-quantity/resource-quantity.component';
import { RenameClassDialogComponent } from './rename-class-dialog/rename-class-dialog.component';
import { PillComponent } from './pill/pill.component';
import { LoginComponent } from './login/login.component';
import { NotificationService } from './services/notification.service';
import { AuthInterceptor } from './services/auth.interceptor';
import { firebaseConfig } from '../environments/firebaseConfig';
import { ModalComponent } from './modal/modal.component';
import { DisplayObjectivesPipe } from './bucket/displayobjectives.pipe';
import { CsumClassPipe } from './objective/csum-class.pipe';
import { AssignSummPartsPipe } from './objective/assign-summ-parts.pipe';
import { MarkdownifyPipe } from './markdown/markdownify.pipe';
import { GroupblocksPipe } from './bucket/groupblocks.pipe';
import { BlockplaceholdersPipe } from './bucket/blockplaceholders.pipe';
import { EditBlockDialogComponent } from './edit-block-dialog/edit-block-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    TeamsComponent,
    TeamPeriodsComponent,
    PeriodComponent,
    BucketComponent,
    ObjectiveComponent,
    PeopleComponent,
    EditPersonDialogComponent,
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
    RenameClassDialogComponent,
    PillComponent,
    LoginComponent,
    ModalComponent,
    DisplayObjectivesPipe,
    CsumClassPipe,
    AssignSummPartsPipe,
    MarkdownifyPipe,
    GroupblocksPipe,
    BlockplaceholdersPipe,
    EditBlockDialogComponent,
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
    AngularFireModule.initializeApp(firebaseConfig.firebase),
    AngularFireAuthModule,
  ],
  providers: [
    StorageService,
    NotificationService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    Title,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
