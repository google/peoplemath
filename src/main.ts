// Copyright 2019-2021, 2025 Google LLC
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

import {
  enableProdMode,
  // ApplicationRef,
  importProvidersFrom,
} from '@angular/core';

import { environment } from './environments/environment';
import { StorageService } from './app/storage.service';
import { NotificationService } from './app/services/notification.service';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { AuthInterceptor } from './app/services/auth.interceptor';
import {
  Title,
  BrowserModule,
  bootstrapApplication,
} from '@angular/platform-browser';
import { AppRoutingModule } from './app/app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { AngularFireModule } from '@angular/fire/compat';
import { firebaseConfig } from './environments/firebaseConfig';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AppComponent } from './app/app.component';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
// import { enableDebugTools } from '@angular/platform-browser';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      FormsModule,
      ReactiveFormsModule,
      LayoutModule,
      AngularFireModule.initializeApp(firebaseConfig.firebase),
      AngularFireAuthModule
    ),
    StorageService,
    NotificationService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      // For accessibility reasons, it is good practice to float the labels when
      // text is not present because in the non-floated state, they look similar
      // to placeholders. And placeholders in general don't look drastically
      // different than input text, and so it's harder to quickly identify empty
      // form fields.
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { floatLabel: 'always' },
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 2500 },
    },
    Title,
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
  ],
})
  // Uncomment to enable console debug tools, such as ng.profiler.timeChangeDetection()
  /*.then((moduleRef) => {
    const applicationRef = moduleRef.injector.get(ApplicationRef);
    const componentRef = applicationRef.components[0];
    enableDebugTools(componentRef);
  })*/
  .catch((err) => console.log(err));
