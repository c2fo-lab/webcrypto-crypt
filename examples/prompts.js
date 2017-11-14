#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"
'use strict';
const readlineSync = require('readline-sync'),
    Wcrypt = require('..');

function askForData() {
    return readlineSync
        .question('Data to encrypt? ');
}

function askForPassphrase() {
    return readlineSync
        .question('Passphrase to use? ',
            {hideEchoBack: true, mask:''}
    );
}

var wcrypt = new Wcrypt.cipher(askForPassphrase());

wcrypt.encrypt(askForData())
.then((data) => {
    console.log(`
        Encrypted, hex-encoded: ${ data.toString('hex') },
        Encrypted, base64-encoded: ${ data.toString('base64') },
        Encrypted, web-safe base64-encoded: ${ wcrypt.uriSafeBase64(data) },

        Decrypted using same passphrase:`
    );
    wcrypt.decrypt(data)
    .then((data) => {
        console.log('        ' + Buffer.from(data).toString('utf8'));
    });
});
