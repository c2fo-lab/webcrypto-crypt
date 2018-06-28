#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"
'use strict';
var async = require('async'),
    browserify = require('browserify'),
    distJs = 'wcrypt.js',
    distFolder = './dist',
    distPath = '../../dist/wcrypt.js',
    exampleFolderBrowser = './examples/browser',
    exampleHtml = 'prompts.html',
    distSource = 'index.js',
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    testJs = 'wcrypt-test.js',
    testDecryptSource = './test/decrypt.js',
    testEncryptSource = './test/encrypt.js',
    testFolderBrowser = './test/browser',
    testHtml = 'wcrypt-test.html';

try {
    distPath = require.resolve('webcrypto-crypt/dist/wcrypt.js');
}
catch (e) {}

async.series([

    function(callback) {
        var folders = [distFolder, exampleFolderBrowser, testFolderBrowser];
        for (var f=0; f < folders.length; f++) {
            mkdirp(folders[f], function (err) {
                if (err) {
                    console.error('ERROR creating ' + folders[f] +
                        ': ' + err.message);
                    process.exit(0);
                }
            });
        }
        callback();
    },

    function(callback) {
        var b = browserify([distSource], {standalone: 'Wcrypt'})
            .transform('babelify', {presets: ['env']});
        b.ignore('node-webcrypto-ossl');
        var jsStream = b.bundle();
        var js = '';
        jsStream.on('data', function (buf) {
            js += buf;
        });
        jsStream.on('end', function () {
            fs.writeFile(distFolder + '/' + distJs, js, function(err) {
                if(err) {
                    console.error('ERROR creating ' + distJs + ': ' +
                        err.message);
                    process.exit(0);
                }
                callback();
            });
        });
    },

    function(callback) {
        var b = browserify([testEncryptSource, testDecryptSource])
            .transform('babelify', {presets: ['env']});
        b.ignore('node-webcrypto-ossl');
        var jsStream = b.bundle();
        var js = '';
        jsStream.on('data', function (buf) {
            js += buf;
        });
        jsStream.on('end', function () {
            fs.writeFile(testFolderBrowser + '/' + testJs, js, function(err) {
                if(err) {
                    console.error('ERROR creating ' + testJs + ': ' +
                        err.message);
                    process.exit(0);
                }
                callback();
            });
        });
    },

    function(callback) {
        var html = '<!DOCTYPE html><html><head><meta charset="utf-8">' +
            '<title>webcrypto-crypt browser tests</title>' +
            '<link href="../../node_modules/mocha/mocha.css" rel="stylesheet" />' + 
            '</head><body><div id="mocha"></div><script ' +
            'src="../../node_modules/expect/lib/index.js"></script><script ' +
            'src="../../node_modules/mocha/mocha.js"></script><script>mocha.setup("bdd")' +
            '</script><script src="' + testJs + '"></script>' +
            '<script>mocha.checkLeaks(); ' + 'mocha.run();</script> </body></html>';
        fs.writeFile(testFolderBrowser + '/' + testHtml, html, function(err) {
            if(err) {
                console.error('ERROR copying ' + testHtml);
                process.exit(0);
            }
            callback();
        });
    },

    function(callback) {
        var html = '<!DOCTYPE html><html><head><meta charset="utf-8">' +
            '<title>webcrypto-crypt browser tests</title>' +
            '<script src="' + distPath + '"></script><script>' +
            '    var wcrypt = new Wcrypt.cipher(prompt("Secret? "));' +
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
        '</script></head><body>(Check the Developer console.)</body></html>';
        fs.writeFile(exampleFolderBrowser + '/' + exampleHtml, html, function(err) {
            if(err) {
                console.error('ERROR copying ' + exampleHtml);
                process.exit(0);
            }
            callback();
        });
    }

]);
