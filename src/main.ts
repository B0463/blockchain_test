import CryptoJS, { SHA512 } from 'crypto-js';
import fs from "fs";
import path from 'path';

function sha256(string: string): string {
    return CryptoJS.SHA256(string).toString(CryptoJS.enc.Hex);
}

