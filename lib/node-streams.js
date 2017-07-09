const split = require('binary-split'),
    through2 = require('through2'),
    Wcrypt = require('../index.js');

module.exports = {

    decrypt: function (passphrase, readableIn) {
        var chunkCount = 0,
            wcrypt;
        return readableIn.pipe(split(Wcrypt.delimiter))
            .pipe(
                through2(
                    function (chunk, enc, callback) {
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
                    }
                )
            )
    },

    encrypt: function (wcrypt, readableIn) {
        var chunkCount = 0;
        return readableIn
            .pipe(through2(function (chunk, enc, callback) {
                var readable = this;
                chunkCount++;
                if (chunkCount === 1) {
                    readable.push(wcrypt.createHeader());
                }
                wcrypt.encryptDelimited(chunk)
                    .then((buf) => {
                        readable.push(buf);
                        callback();
                    })
                    .catch((err) => {
                        callback(err);
                    });
            }));
    }

};

