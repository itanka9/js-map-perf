export class MapIds {
    constructor() {
        this.ids = new Map();
        this.index = 0;
    }

    insert(id) {
        this.ids.set(id, this.index);
        this.index++;
    }

    find(id) {
        return this.ids.get(id);
    }

    delete(id) {
        this.ids.set(id, undefined);
    }

    deleteHard (id) {
        delete this.ids.delete(id);
    }

    serialize() {
        return JSON.stringify(Array.from(this.ids.entries()));
    }

    deserialize(data) {
        this.ids = new Map(JSON.parse(data));
    }
}
