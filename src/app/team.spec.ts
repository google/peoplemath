/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Team, ImmutableTeam } from "./team";

describe('ImmutableTeam', () => {
    const _mut: Team = new Team('myteam', 'My Team');
    const team = new ImmutableTeam(_mut);

    it('should convert', () => {
        expect(team.toOriginal()).toEqual(_mut);
    });

    it('should be immutable', () => {
        const shadow: Team = team;
        expect(() => {shadow.displayName = 'random'; }).toThrowError(/Cannot set property displayName/);
        expect(team.displayName).toEqual('My Team');
    });
});