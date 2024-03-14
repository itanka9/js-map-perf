export class ObjIds {
    constructor() {
        this.ids = {};
        this.index = 0;
    }

    insert(id) {
        this.ids[id] = this.index;
        this.index++;
    }

    find(id) {
        return this.ids[id];
    }

    delete(id) {
        this.ids[id];
    }

    deleteHard (id) {
        delete this.ids[id];
    }

    serialize() {
        return JSON.stringify(this.ids);
    }

    deserialize(data) {
        this.ids = JSON.parse(data);
    }
}
