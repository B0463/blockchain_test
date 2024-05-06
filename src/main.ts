import CryptoJS from 'crypto-js';

function hashStr(string: string): string {
    return CryptoJS.SHA256(string).toString(CryptoJS.enc.Hex);
}

let blockNumber = 0
let blockData = "teste";
let nonce = 0;
let resultHash = "";

for(let i=0;true;i++) {
    resultHash = hashStr(blockNumber.toString()+i.toString()+blockData);
    if(resultHash.substring(0, 4) == "0000") {
        nonce = i;
        break;
    }
}

console.log(
    `blockNumber: \x1b[1;36m${blockNumber}\x1b[0m\n`+
    `nonce: \x1b[1;35m${nonce}\x1b[0m\n`+
    `blockData: \x1b[1;37m\n${blockData}\x1b[0m\n\n`+
    `hash: \x1b[1;32m${resultHash}\x1b[0m`
);
