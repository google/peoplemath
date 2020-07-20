// Copyright 2019 Google LLC
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

// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular.json`.

export const environment = {
  production: false,
  // TODO: This config needs to be moved to a different file if firebase is used
  firebase: {
    apiKey: 'AIzaSyCQUWjKP75Q168Y9utysPPEMhd3p0KtOXc',
    // authDomain: 'localhost',
    authDomain: 'samicolon-peoplemath-test.firebaseapp.com',
    projectId: 'samicolon-peoplemath-test',
    appId: '1:192809429113:web:977f2c0ccad3745e634ca8',
    /*messagingSenderId: '192809429113',
    storageBucket: 'samicolon-peoplemath-test.appspot.com',
    databaseURL: 'https://samicolon-peoplemath-test.firebaseio.com'*/
  }
};
