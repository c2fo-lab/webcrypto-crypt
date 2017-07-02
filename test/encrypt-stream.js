const Config = require('../lib/config.json'),
    expect = require('expect'),
    fs = require('fs'),
    mocks = new (require('./mocks.js'))(),
    nodeStream = require('../lib/node-streams.js'),
    Package = require('../package.json'),
    transcoder = new (require('../lib/transcoder.js'))(),
    Wcrypt = require('../index.js');

const data = mocks.data,
    testOptions = {material: {
        iv: mocks.iv,
        passphrase: mocks.passphrase,
        salt: mocks.salt
    }};

describe("Encrypt stream", function() {

    it("Returns expected buffer", (done) => {
        var hexEncoded = '',
            wcrypt = new Wcrypt.cipher(testOptions);
        const readme = fs.createReadStream(__dirname + '/../LICENSE');
        let readableEncrypted = nodeStream.encrypt(wcrypt, readme);
        readableEncrypted.on('data', (chunk) => {
            hexEncoded = hexEncoded + chunk.toString('hex');
        });
        readableEncrypted.on('finish', () => {
            expect(hexEncoded).toEqual(data.license.hex);
            done();
        });
    });

});
