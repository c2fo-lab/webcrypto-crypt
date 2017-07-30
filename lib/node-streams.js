const split = require('binary-split'),
    Config = require('./config.json'),
    through2 = require('through2'),
    Wcrypt = require('../index.js');

module.exports = exports = {

    decrypt: function (passphrase, ciphertextIn) {
        var chunkCount = 0,
            wcrypt;
        return ciphertextIn.pipe(
            split(Wcrypt.delimiter)
        )
        .on('error', (err) => {
            ciphertextIn.emit('error', Config.err.chunkDecrypt + err);
        })
        .pipe(
            through2(function (chunk, enc, callback) {
                chunkCount++;
                if (chunkCount === 1) {
                    Wcrypt.debug('Reading header.');
                    try {
                        var data = Wcrypt.parseHeader(chunk);
                        if (typeof passphrase === 'string')
                            data.material.passphrase = passphrase;
                        else
                            data.material.passphrase = passphrase();
                        wcrypt = new Wcrypt.cipher(data);
                        callback();
                    }
                    catch (err) {
                        ciphertextIn.emit('error', Config.err.chunkDecrypt + err);
                        callback(err);
                    }
                }
                else {
                    Wcrypt.debug('Reading chunk ' + (chunkCount - 1) + '.');
                    wcrypt.rawDecrypt(chunk)
                        .then((data) => {
                            this.push(data);
                            callback();
                        })
                        .catch((err) => {
                            callback(err);
                        });
                }
            })
            .on('error', (err) => {
                ciphertextIn.emit('error', Config.err.chunkDecrypt + err);
            })
        )
        .on('error', (err) => {
            ciphertextIn.emit('error', Config.err.fileDecrypt + err);
        });
    },

    encrypt: function (wcrypt, cleartextIn) {
        var chunkCount = 0;
        return cleartextIn
            .pipe(
                through2(function (chunk, enc, callback) {
                    var encrypted = this;
                    chunkCount++;
                    if (chunkCount === 1) {
                        encrypted.push(wcrypt.createHeader());
                    }
                    wcrypt.encryptDelimited(chunk)
                        .then((buf) => {
                            encrypted.push(buf);
                            callback();
                        })
                        .catch((err) => {
                            callback(err);
                        });
                })
            )
            .on('error', (err) => {
                cleartextIn.emit(Config.err.chunkEncrypt + err);
            });
    }

};

