import CryptoJS, { SHA512 } from 'crypto-js';
import sqlite3 from 'sqlite3';
import Express from 'express';
import bodyParser from 'body-parser';

console.log("imported libs");

const db = new sqlite3.Database(':memory:');
const app = Express();

console.log("db and app inicializes");

function sha256(string: string): string {
    return CryptoJS.SHA256(string).toString(CryptoJS.enc.Hex);
}

db.serialize(() => {
    console.log("creating table");
    db.run('CREATE TABLE blocks (id INTEGER PRIMARY KEY, nonce INTEGER, data TEXT, prevHash TEXT, hash TEXT)');
});

function addBlock(id, nonce, data, prevHash, hash) {
    console.log("adding block id: "+id);
    db.serialize(() => {
        db.run('INSERT INTO blocks (id, nonce, data, prevHash, hash) VALUES (?, ?, ?, ?, ?)', [nonce, data, prevHash, hash], function(err) {
            if (err) {
                console.error('Error writing data:', err.message);
            } else {
                console.log(`New block added with id: ${id}`);
            }
        });
    });
}

function makeGenesis() {
    console.log("making genesis");
    const id = 0;
    let nonce = 0;
    const data = "genesis";
    const prevHash = "0000000000000000000000000000000000000000000000000000000000000000";
    let hash = "";


    for(let i=0;true;i++) {
        hash = sha256(id.toString()+i.toString()+data+prevHash);
        if(hash.substring(0, 4) == "0000") {
            nonce = i;
            break;
        }
    }

    addBlock(id, nonce, data, prevHash, hash);
    const resp = 
        `added block id: ${id}\n`+
        `nonce: ${nonce}\n`+
        `data: ${data}\n`+
        `prevHash: ${prevHash}\n`+
        `hash: ${hash}\n`;
    console.log(resp);
    return hash;
}
let lastHash = makeGenesis();
let lastId = 0;

app.use(bodyParser.json());
app.post("/addBlock", (req, res)=>{
    lastId++;
    const id = lastId;
    let nonce = 0;
    const data = req.body.data;
    const prevHash = lastHash;
    let hash = "";

    for(let i=0;true;i++) {
        hash = sha256(id.toString()+i.toString()+data+prevHash);
        if(hash.substring(0, 4) == "0000") {
            nonce = i;
            break;
        }
    }
    addBlock(id, nonce, data, prevHash, hash);
    lastHash = hash;
    const resp = 
        `added block id: ${id}\n`+
        `nonce: ${nonce}\n`+
        `data: ${data}\n`+
        `prevHash: ${prevHash}\n`+
        `hash: ${hash}\n`;
    console.log(resp);
    res.status(200).send(resp);
});

app.listen(3000, ()=>{
    console.log("server ok port 3000");
});
