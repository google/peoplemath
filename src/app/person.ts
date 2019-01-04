export class Person {
    constructor(
        public id: string,
        public displayName: string,
        public availability: number,
    ) {}
}

export function personDisplayNameWithUsername(person: Person): string {
    if (person.id == person.displayName || !person.displayName) {
        return person.id;
    }
    return person.displayName + " (" + person.id + ")";
}