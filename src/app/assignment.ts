export class Assignment {
    constructor (
        public personId: string,
        commitment: number,
    ) {
        this.commitment = commitment;
    }

    private _commitment: number;

    get commitment(): number {
        return this._commitment;
    }

    set commitment(c: number) {
        this._commitment = c >= 0 ? c : 0;
    }
}