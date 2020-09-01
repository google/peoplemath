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

export class Team {
    constructor(
        public id: string,
        public displayName: string,
        public permissions?: TeamPermissions
    ) {}
}

export class TeamPermissions {
  constructor(
    public read: Permission,
    public write: Permission,
    public viewAllTeams: Permission,
    public addTeam: Permission,
  ) {
  }
}

export class Permission {
  constructor(
    public allow: Principal[]
  ) {
  }
}

export class Principal {
  constructor(
    public type: string,
    public id: string
  ) {
  }
}

export class ImmutableTeam {
  private readonly _id: string;
  private readonly _displayName: string;
  private readonly _permissions?: TeamPermissions;

  get id(): string { return this._id; }
  get displayName(): string { return this._displayName; }
  get permissions(): TeamPermissions | undefined { return this._permissions; }

  constructor(t: Team) {
    this._id = t.id;
    this._displayName = t.displayName;
    this._permissions = t.permissions;
  }

  toOriginal(): Team {
      return new Team(this.id, this.displayName, this.permissions);
  }
}
