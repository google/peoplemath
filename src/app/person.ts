export class Person {
    constructor(
        public id: string,
        public displayName: string,
        availability: number,
    ) {
        this.availability = availability;
    }

    private _availability: number;

    set availability(avail: number) {
        this._availability = avail >= 0 ? avail : 0;
    }

    get availability(): number {
        return this._availability;
    }
}