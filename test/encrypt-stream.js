const expect = require('expect')
const fs = require('fs')
const mocks = new (require('./mocks.js'))()
const nodeStream = require('../lib/node-streams.js')
const path = require('path')
const stream = require('stream')
const Wcrypt = require('../index.js')

const data = mocks.data
const testOptions = {
  material: {
    iv: mocks.iv,
    passphrase: mocks.passphrase,
    salt: mocks.salt
  }
}

function isReadableStream (obj) {
  return obj instanceof stream.Stream &&
        typeof (obj._read === 'function') &&
        typeof (obj._readableState === 'object')
}

describe('Encrypt stream', function () {
  it('Returns a readable stream', (done) => {
    var wcrypt = new Wcrypt.Cipher(testOptions)
    const license = fs.createReadStream(path.join(__dirname, '/../LICENSE'))
    const licenseEncrypted = nodeStream.encrypt(wcrypt, license)
    expect(isReadableStream(licenseEncrypted)).toBeTruthy()
    done()
  })

  it('Generates expected output', (done) => {
    var hexEncoded = ''
    var wcrypt = new Wcrypt.Cipher(testOptions)
    const license = fs.createReadStream(path.join(__dirname, '/../LICENSE'))
    const readableEncrypted = nodeStream.encrypt(wcrypt, license)
    readableEncrypted.on('data', (chunk) => {
      hexEncoded = hexEncoded + chunk.toString('hex')
    })
    readableEncrypted.on('finish', () => {
      try {
        expect(hexEncoded).toEqual(data.license.hex)
        done()
      } catch (err) {
        done(err)
      }
    })
  })
})
