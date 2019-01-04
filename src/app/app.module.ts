import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';


import { AppComponent } from './app.component';
import { AppRoutingModule } from './/app-routing.module';
import { TeamsComponent } from './teams/teams.component';
import { TeamPeriodsComponent } from './teamperiods/teamperiods.component';
import { PeriodComponent } from './period/period.component';
import { OkrStorageService } from './okrstorage.service';
import { BucketComponent } from './bucket/bucket.component';
import { ObjectiveComponent } from './objective/objective.component';
import { AssignmentComponent } from './assignment/assignment.component';
import { PeopleComponent } from './people/people.component';
import { AssignmentsByPersonComponent } from './assignments-by-person/assignments-by-person.component';


@NgModule({
  declarations: [
    AppComponent,
    TeamsComponent,
    TeamPeriodsComponent,
    PeriodComponent,
    BucketComponent,
    ObjectiveComponent,
    AssignmentComponent,
    PeopleComponent,
    AssignmentsByPersonComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
  ],
  providers: [
    OkrStorageService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
