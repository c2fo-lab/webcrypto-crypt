const split = require('binary-split'),
    Config = require('./config.json'),
    through2 = require('through2'),
    Wcrypt = require('../index.js');

module.exports = {

    decrypt: function (passphrase, readableIn) {
        var chunkCount = 0,
            wcrypt;
        return readableIn.pipe(split(Wcrypt.delimiter))
            .pipe(
                through2(function (chunk, enc, callback) {
                    chunkCount++;
                    if (chunkCount === 1) {
                        Wcrypt.debug('Reading header.');
                        var data = Wcrypt.parseHeader(chunk);
                        if (typeof passphrase === 'string')
                            data.material.passphrase = passphrase;
                        else
                            data.material.passphrase = passphrase();
                        wcrypt = new Wcrypt.cipher(data);
                        callback();
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
            }))
            .on('error', (err) => {
                process.stderr.write(Config.err.chunkDecrypt + err + "\n");
            });
    },

    encrypt: function (wcrypt, readableIn) {
        var chunkCount = 0;
        return readableIn
            .pipe(through2(function (chunk, enc, callback) {
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
            }))
            .on('error', (err) => {
                process.stderr.write(Config.err.chunkEncrypt + err + "\n");
            });
    }

};

