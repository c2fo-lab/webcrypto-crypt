const Config = require('../lib/config.json'),
    expect = require('expect'),
    fs = require('fs'),
    mocks = new (require('./mocks.js'))(),
    nodeStream = require('../lib/node-streams.js'),
    stream = require('stream'),
    Package = require('../package.json'),
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

describe("Encrypt stream", function() {

    it("Returns a readable stream", (done) => {
        var wcrypt = new Wcrypt.cipher(testOptions);
        const license = fs.createReadStream(__dirname + '/../LICENSE'),
            licenseEncrypted = nodeStream.encrypt(wcrypt, license);
        expect(isReadableStream(licenseEncrypted)).toExist();
        done();
    });

    it("Generates expected output", (done) => {
        var hexEncoded = '',
            wcrypt = new Wcrypt.cipher(testOptions);
        const license = fs.createReadStream(__dirname + '/../LICENSE');
        let readableEncrypted = nodeStream.encrypt(wcrypt, license);
        readableEncrypted.on('data', (chunk) => {
            hexEncoded = hexEncoded + chunk.toString('hex');
        });
        readableEncrypted.on('finish', () => {
            try {
                expect(hexEncoded).toEqual(data.license.hex);
                done();
            }
            catch(err) {
                done(err);
            }
        });
    });

});
