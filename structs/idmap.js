export class IdMap {
    constructor() {
        this.map = {};
        this.index = 0;
    }

    insert(key) {
        let hiIdsMap = this.map[key.lo];
        if (hiIdsMap === undefined) {
            hiIdsMap = this.map[key.lo] = {};
        }
        this.index++;
        hiIdsMap[key.hi] = this.index;
    }

    delete (key) {
        const hiIdsMap = this.map[key.lo];
        if (hiIdsMap === undefined) {
            return;
        }
        hiIdsMap[key.hi] = undefined;
    }

    deleteHard (key) {
        const hiIdsMap = this.map[key.lo];
        if (hiIdsMap === undefined) {
            return;
        }
        delete hiIdsMap[key.hi];
        if (Object.keys(this.map[key.lo]).length === 0) {
            delete this.map[key.lo];
        }
    }

    find(key) {
        if (this.map[key.lo] === undefined) {
            return undefined;
        }
        return this.map[key.lo][key.hi];
    }

    serialize() {
        return JSON.stringify(this.map);
    }

    deserialize(data) {
        this.map = JSON.parse(data);
    }
}
