#!/bin/sh
':' // ; exec "$(command -v nodejs || command -v node)" "$0" "$@"
'use strict'
var async = require('async')
var browserify = require('browserify')
var distJs = 'wcrypt.js'
var distFolder = './dist'
var distPath = '../../dist/wcrypt.js'
var exampleFolderBrowser = './examples/browser'
var exampleHtml = 'prompts.html'
var distSource = 'index.js'
var fs = require('fs-extra')
var testJs = 'wcrypt-test.js'
var testDecryptSource = './test/decrypt.js'
var testEncryptSource = './test/encrypt.js'
var testFolderBrowser = './test/browser'
var testHtml = 'wcrypt-test.html'

try {
  distPath = require.resolve('webcrypto-crypt/dist/wcrypt.js')
} catch (e) {}

async.series([

  function (callback) {
    fs.ensureDir(distFolder, err => {
      if (err) {
        console.error(err)
        process.exit(0)
      } else {
        callback()
      }
    })
  },

  function (callback) {
    fs.ensureDir(exampleFolderBrowser, err => {
      if (err) {
        console.error(err)
        process.exit(0)
      } else {
        callback()
      }
    })
  },

  function (callback) {
    fs.ensureDir(testFolderBrowser, err => {
      if (err) {
        console.error(err)
        process.exit(0)
      } else {
        callback()
      }
    })
  },

  function (callback) {
    var b = browserify({standalone: 'Wcrypt'})
    b.add(distSource)
    b.ignore('node-webcrypto-ossl')
    b.bundle().pipe(fs.createWriteStream(distFolder + '/' + distJs))
    callback()
  },

  function (callback) {
    var b = browserify()
    b.add([testEncryptSource, testDecryptSource])
    b.ignore('node-webcrypto-ossl')
    b.bundle().pipe(fs.createWriteStream(testFolderBrowser + '/' + testJs))
    callback()
  },

  function (callback) {
    var html = '<!DOCTYPE html><html><head><meta charset="utf-8">' +
            '<title>webcrypto-crypt browser tests</title>' +
            '<link href="../../node_modules/mocha/mocha.css" rel="stylesheet" />' +
            '</head><body><div id="mocha"></div><script ' +
            'src="../../node_modules/expect/lib/index.js"></script><script ' +
            'src="../../node_modules/mocha/mocha.js"></script><script>mocha.setup("bdd")' +
            '</script><script src="' + testJs + '"></script>' +
            '<script>mocha.checkLeaks(); ' + 'mocha.run();</script> </body></html>'
    fs.writeFile(testFolderBrowser + '/' + testHtml, html, function (err) {
      if (err) {
        console.error('ERROR copying ' + testHtml)
        process.exit(0)
      }
      callback()
    })
  },

  function (callback) {
    var html = '<!DOCTYPE html><html><head><meta charset="utf-8">' +
            '<title>webcrypto-crypt browser tests</title>' +
            '<script src="' + distPath + '"></script><script>' +
            '    var wcrypt = new Wcrypt.Cipher(prompt("Secret? "));' +
            '    wcrypt.encrypt(prompt("Data to encrypt? "))' +
            '    .then((data) => {' +
            '         console.log(' +
            '             "\\nEncrypted, hex-encoded: " + data.toString("hex"),' +
            '             "\\nEncrypted, base64-encoded: " + data.toString("base64"),' +
            '             "\\nEncrypted, web-safe base64-encoded: " + wcrypt.uriSafeBase64(data),' +
            '             "\\n\\nDecrypted using same passphrase:" ' +
            '         );' +
            '         wcrypt.decrypt(data)' +
            '             .then((data) => {' +
            '                 console.log(Buffer.from(data).toString("utf8")); ' +
            '             });' +
            '    });' +
        '</script></head><body>(Check the Developer console.)</body></html>'
    fs.writeFile(exampleFolderBrowser + '/' + exampleHtml, html, function (err) {
      if (err) {
        console.error('ERROR copying ' + exampleHtml)
        process.exit(0)
      }
      callback()
    })
  }

])
