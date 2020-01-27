const expect = require('expect')
const fs = require('fs')
const mocks = new (require('./mocks.js'))()
const nodeStream = require('../lib/node-streams.js')
const Readable = require('stream').Readable
const path = require('path')
const stream = require('stream')

const data = mocks.data

function isReadableStream (obj) {
  return obj instanceof stream.Stream &&
        typeof (obj._read === 'function') &&
        typeof (obj._readableState === 'object')
}

describe('Decrypt stream', function () {
  it('Returns a readable stream', (done) => {
    var s = new Readable()
    s._read = function noop () {}
    s.push(Buffer.from(data.license.hex, 'hex'))
    s.push(null)
    const readableDecrypted = nodeStream.decrypt(mocks.passphrase, s)
    expect(isReadableStream(readableDecrypted)).toBeTruthy()
    done()
  })

  it('Generates expected output', (done) => {
    var plaintext = ''
    var s = new Readable()
    s._read = function noop () {}
    s.push(Buffer.from(data.license.hex, 'hex'))
    s.push(null)
    const readableDecrypted = nodeStream.decrypt(mocks.passphrase, s)
    readableDecrypted.on('data', (chunk) => {
      plaintext = plaintext + chunk.toString('utf8')
    })
    readableDecrypted.on('finish', () => {
      var licensePlaintext = fs.readFileSync(path.join(__dirname, '/../LICENSE'))
      try {
        expect(Buffer.from(plaintext, 'utf8')).toEqual(licensePlaintext)
        done()
      } catch (err) {
        console.error(err.message)
      }
    })
    readableDecrypted.on('error', (err) => {
      done(err)
    })
  })
})
