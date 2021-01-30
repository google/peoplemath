// Copyright 2019-2021 Google LLC
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

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamsComponent } from './teams/teams.component';
import { TeamPeriodsComponent } from './teamperiods/teamperiods.component';
import { PeriodComponent } from './period/period.component';
import { PeriodSummaryComponent } from './period-summary/period-summary.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/teams', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'teams', component: TeamsComponent, canActivate: [AuthGuard] },
  {
    path: 'team/:team',
    component: TeamPeriodsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'team/:team/period/:period',
    component: PeriodComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'team/:team/periodsummary/:period',
    component: PeriodSummaryComponent,
    canActivate: [AuthGuard],
  },

  { path: 'unauthenticated', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
