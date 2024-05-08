import CryptoJS, { SHA512 } from 'crypto-js';
import sqlite3 from 'sqlite3';
import Express from 'express';
import bodyParser from 'body-parser';

const db = new sqlite3.Database(':memory:');
const app = Express();

function sha256(string: string): string {
    return CryptoJS.SHA256(string).toString(CryptoJS.enc.Hex);
}

db.serialize(() => {
    db.run('CREATE TABLE blocks (id INTEGER PRIMARY KEY, nonce INTEGER, data TEXT, prevHash TEXT, hash TEXT)');
});

function mineBLock(id, data, prevHash) {
    let nonce = 0;
    let hash = "";
    for(let i=0;true;i++) {
        hash = sha256(id.toString()+i.toString()+data+prevHash);
        if(hash.substring(0, 4) == "0000") {
            nonce = i;
            break;
        }
    }
    return {nonce, hash}
}

function addBlock(id, nonce, data, prevHash, hash) {
    db.serialize(() => {
        db.run('INSERT INTO blocks (id, nonce, data, prevHash, hash) VALUES (?, ?, ?, ?, ?)', [id, nonce, data, prevHash, hash], function(err) {
            if (err) {
                console.error('Error writing data:', err.message);
            }
        });
    });
}

function readBlock(id): Promise<any | null> {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM blocks WHERE id = ?', [id], (err, row) => {
            if(err) {
                reject(err);
            } else if(row) {
                resolve(row);
            } else {
                console.log(`No block with id: ${id}`);
                resolve(null);
            }
        });
    });
}


function makeGenesis() {
    console.log("\x1b[1;37mmaking genesis: \x1b[0m");
    const id = 0;
    const data = "genesis";
    const prevHash = "0000000000000000000000000000000000000000000000000000000000000000";

    const { nonce, hash } = mineBLock(id, data, prevHash);

    addBlock(id, nonce, data, prevHash, hash);
    const resp = 
        `id: \x1b[1;36m${id}\x1b[0m\n`+
        `nonce: \x1b[1;35m${nonce}\x1b[0m\n`+
        `data: \x1b[1;37m${data}\x1b[0m\n`+
        `prevHash: \x1b[0;32m${prevHash}\x1b[0m\n`+
        `hash: \x1b[1;32m${hash}\x1b[0m\n`;
    console.log(resp);
    return hash;
}
let lastHash = makeGenesis();
let lastId = 0;

app.use(bodyParser.json());

app.post("/addBlock", (req, res)=>{
    lastId++;
    const id = lastId;
    const data = req.body.data;
    const prevHash = lastHash;

    const { nonce, hash } = mineBLock(id, data, prevHash);

    addBlock(id, nonce, data, prevHash, hash);
    lastHash = hash;
    const resp = 
        `id: \x1b[1;36m${id}\x1b[0m\n`+
        `nonce: \x1b[1;35m${nonce}\x1b[0m\n`+
        `data: \x1b[1;37m${data}\x1b[0m\n`+
        `prevHash: \x1b[0;32m${prevHash}\x1b[0m\n`+
        `hash: \x1b[1;32m${hash}\x1b[0m\n`;
    console.log(resp);
    res.status(200).send(resp);
});

app.post("/getBlock", (req, res)=>{
    readBlock(req.body.id).then(row => {
        if(row) {
            const resp = 
            `id: \x1b[1;36m${lastId}\x1b[0m\n`+
            `nonce: \x1b[1;35m${row.nonce}\x1b[0m\n`+
            `data: \x1b[1;37m${row.data}\x1b[0m\n`+
            `prevHash: \x1b[0;32m${row.prevHash}\x1b[0m\n`+
            `hash: \x1b[1;32m${row.hash}\x1b[0m\n`;
            res.status(200).send(resp);
        }
        else res.status(200).send("no block with id "+req.body.id);
    })
    .catch(err => {
        console.error('Error reading block:', err);
    });
});
app.post("/lastId", (req, res)=>{
    res.status(200).send(lastId.toString());
});

app.listen(3000, ()=>{
    console.log("\x1b[1;34m - server ok port 3000\n\x1b[0m");
});
