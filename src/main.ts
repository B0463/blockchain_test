import CryptoJS from 'crypto-js';
import fs from "fs";
import path from 'path';
const inBlocks = require("../blocks.json");

let resultBlocks = inBlocks;

function hashStr(string: string): string {
    return CryptoJS.SHA256(string).toString(CryptoJS.enc.Hex);
}

console.log(inBlocks.length+" blocks found. mining...\n\n");

for(let block=0;block < inBlocks.length;block++) {
    if(inBlocks[block].verified == true) {
        console.log(`block ${block} is verified.\n\n`);
        continue;
    }
    let blockNumber = inBlocks[block].number;
    let nonce = 0
    let blockData = inBlocks[block].data;
    let hashWord = "";
    let resultHash = "";

    for(let i=0;true;i++) {
        resultHash = hashStr(blockNumber.toString()+i.toString()+blockData);
        if(resultHash.substring(0, 4) == "0000") {
            nonce = i;
            break;
        }
    }
    hashWord = `\x1b[1;35m${blockNumber.toString()}\x1b[0m\x1b[1;36m${nonce.toString()}\x1b[0m\x1b[1;37m${blockData}\x1b[0m`;
    console.log(
        `blockNumber: \x1b[1;35m${blockNumber}\x1b[0m\n`+
        `nonce: \x1b[1;36m${nonce}\x1b[0m\n`+
        `blockData: \x1b[1;37m\n${blockData}\x1b[0m\n\n`+
        `hashWord: "${hashWord}"\n`+
        `hash: \x1b[1;32m${resultHash}\x1b[0m\n\n`
    );
    resultBlocks[block].verified = true;
    resultBlocks[block].nonce = nonce;
    resultBlocks[block].hash = resultHash;
}


try {
    fs.writeFileSync(path.resolve(__dirname, '../blocksMined.json'), JSON.stringify(resultBlocks, null, 2));
    console.log("'../blocksMined.json' writed.");
} catch (error) {
    console.error("Error writing '../blocksMined.json':", error);
}

console.log("all blocks verified.");
