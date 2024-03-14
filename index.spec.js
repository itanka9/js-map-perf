import { MapIds } from './structs/map.js';
import { ObjIds } from './structs/obj.js';
import { IdMap } from './structs/idmap.js';

const content = [];
let level = 0;
const hooks = {};
let beforeAllRun = false;
let afterAllRun = false;

const results = {}

const sizes = [
    10**4,
    10**5,
    10**6,
//    10**7,
];

const structs = {
    obj: ObjIds,
    map: MapIds,
    idmap: IdMap
   //  hash: HashIds
};

describe('ids speed test', () => {
    let datasets = {};
    let int64dataset = {}

    beforeAll(() => {
        for (const sz of sizes) {
            datasets[sz] = generateIds(4, 20, sz);
            int64dataset[sz] = generateInt64s(sz)
        }
    });

    afterAll(() => {
        content.push(formatResults());
        document.body.innerHTML = content.join('');
    })

    for (const sz of sizes) {
        for (const struct in structs) {
            it(`insert ${sz} ids in ${struct}`, () => {
                const ids = new structs[struct]();
                const samples = struct === 'idmap' ? int64dataset[sz] : datasets[sz];
                for (let a = 0; a < 10; a++) {
                    const start = Date.now();
                    for (const id of samples) {
                        ids.insert(id);
                    }
                    const end = Date.now();
                    if (a > 1) {
                        storeResult(struct, sz, 'insert', end - start);    
                    }
                }
            });

            it(`delete ${sz} ids in ${struct}`, () => {
                const ids = new structs[struct]();
                const samples = struct === 'idmap' ? int64dataset[sz] : datasets[sz];
                for (let a = 0; a < 10; a++) {
                    for (const id of samples) {
                        ids.insert(id);
                    }    
                    const start = Date.now();
                    for (const id of samples) {
                        ids.deleteHard(id);
                    }
                    const end = Date.now();
                    if (a > 1) {
                        storeResult(struct, sz, 'delete', end - start);
                    }
                }
            });

            it(`find ${sz} ids in ${struct}`, () => {
                const ids = new structs[struct]();
                const samples = struct === 'idmap' ? int64dataset[sz] : datasets[sz];
                for (const id of samples) {
                    ids.insert(id);
                }
            
                for (let a = 0; a < 10; a++) {
                    const start = Date.now();
                    let x = 0;
                    for (const id of samples) {
                        x = ids.find(id);
                    }
                    console.log(x);
                    const end = Date.now();
                    if (a > 1) {
                        storeResult(struct, sz, 'find', end - start);
                    }
                }
            });

            it(`serialize ${sz} ids in ${struct}`, () => {
                const ids = new structs[struct]();
                const samples = struct === 'idmap' ? int64dataset[sz] : datasets[sz];
                for (const id of samples) {
                    ids.insert(id);
                }

                const start = Date.now();
                ids.serialize();
                const end = Date.now();
                storeResult(struct, sz, 'serialize', end - start);
            });

            it(`deserialize ${sz} ids in ${struct}`, () => {
                const ids = new structs[struct]();
                const samples = struct === 'idmap' ? int64dataset[sz] : datasets[sz];
                for (const id of samples) {
                    ids.insert(id);
                }
                const serizlied = ids.serialize();
                const start = Date.now();
                ids.deserialize(serizlied);
                const end = Date.now();
                storeResult(struct, sz, 'deserialize', end - start);
            });
        }
    }
})

/*******************************************************************************
 * 
 *    Все что ниже - вспомогательные функции
 * 
 ******************************************************************************/

function generateIds (min, max, count) {
    const result = []
    for (let i = 0; i < count; i++) {
        result.push(randomString(min, max));
    }
    return result
}

function generateInt64s (count) {
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push({lo: Math.floor(Math.random() * 10**9), hi: Math.floor(Math.random() * 10**9)});
    }
    return result
}

function randomString(min, max) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const length = Math.floor(Math.random() * (max - min + 1)) + min;
    for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function storeResult(struct, sz, action, time) {
    if (!results[action]) {
        results[action] = {};
    }
    const actionResults = results[action];
    if (!actionResults[struct]) {
        actionResults[struct] = {};
    }
    const structResults = actionResults[struct];
    if (!structResults[sz]) {
        structResults[sz] = [];
    }
    const sizeResults = structResults[sz];
    sizeResults.push(time);
}

function formatResults () {
    const output = [];
    for (const action in results) {
        output.push(`<h2>${action}</h2>`);
        output.push('<table>');
        const actionResults = results[action];
        const head = [`<th>struct</th>`];
        for (const sz of sizes) {
            head.push(`<th>${sz}</th>`);
        }
        output.push(`<tr>${head.join('')}</tr>`);
        for (const struct in structs) {
            const row = [`<td>${struct}</td>`];
            for (const sz of sizes) {
                const avg = actionResults[struct][sz].reduce((a, b) => a + b, 0) / actionResults[struct][sz].length;
                row.push(`<td>${avg.toPrecision(5)}</td>`);
            }
            output.push(`<tr>${row.join('')}</tr>`);
        }
        output.push('</table>');
    }
    return output.join('');
}

function describe(name, fn) {
    level += 1;
    content.push(`<h${level}>${name}</h${level}>`);
    fn();
    level -= 1;
    if (level === 0 && !afterAllRun) {
        (hooks.afterAll ?? []).forEach(fn => fn());
        afterAllRun = true;
    }
}

function beforeAll (fn) {
    if (!hooks.beforeAll) {
        hooks.beforeAll = [];
    }
    hooks.beforeAll.push(fn);
}

function afterAll (fn) {
    if (!hooks.afterAll) {
        hooks.afterAll = [];
    }
    hooks.afterAll.push(fn);
}


function it(name, fn) {
    if (!beforeAllRun) {
        (hooks.beforeAll ?? []).forEach(fn => fn());
        beforeAllRun = true;
    }
    fn();
}