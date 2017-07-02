const through2 = require('through2');

module.exports = {

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
                });
            }));
    }

};

