const Config = require('../lib/config.json'),
    expect = require('expect'),
    fs = require('fs'),
    mocks = new (require('./mocks.js'))(),
    nodeStream = require('../lib/node-streams.js'),
    Package = require('../package.json'),
    Readable = require('stream').Readable,
    stream = require('stream'),
    transcoder = new (require('../lib/transcoder.js'))(),
    Wcrypt = require('../index.js');

const data = mocks.data,
    testOptions = {material: {
        iv: mocks.iv,
        passphrase: mocks.passphrase,
        salt: mocks.salt
    }};

function isReadableStream(obj) {
    return obj instanceof stream.Stream &&
        typeof (obj._read === 'function') &&
        typeof (obj._readableState === 'object');
}

describe("Decrypt stream", function() {

    it("Returns a readable stream", (done) => {
        var wcrypt = new Wcrypt.cipher(testOptions);
        var s = new Readable();
        s._read = function noop() {};
        s.push(Buffer.from(data.license.hex, 'hex'));
        s.push(null);
        let readableDecrypted = nodeStream.decrypt(mocks.passphrase, s);
        expect(isReadableStream(readableDecrypted)).toExist();
        done();
    });

    it("Generates expected output", (done) => {
        var plaintext = '',
            wcrypt = new Wcrypt.cipher(testOptions);
        var s = new Readable();
        s._read = function noop() {};
        s.push(Buffer.from(data.license.hex, 'hex'));
        s.push(null);
        let readableDecrypted = nodeStream.decrypt(mocks.passphrase, s);
        readableDecrypted.on('data', (chunk) => {
            plaintext = plaintext + chunk.toString('utf8');
        });
        readableDecrypted.on('finish', () => {
            var licensePlaintext = fs.readFileSync(__dirname + '/../LICENSE');
            try {
                expect(plaintext).toEqual(licensePlaintext);
                done();
            }
            catch (err) {
                console.error(err.message);
            }
        });
        readableDecrypted.on('error', (err) => {
            done(err);
        });
    });

});
