#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"
'use strict';
const Config = require('../lib/config.json'),
    Readable = require('stream').Readable,
    chop = require('chop'),
    fs = require('fs'),
    os = require('os'),
    homePassFile = os.homedir() + '/.wcryptpass',
    readlineSync = require('readline-sync'),
    util = require('util'),
    readFile = util.promisify(fs.readFile),
    statFile = util.promisify(fs.stat),
    Wcrypt = require('../index.js'),
    wcryptStream = require('../lib/node-streams.js'),
    yargs = require('yargs');

Wcrypt.DEBUG = false;

// Data piped to us
if (!process.stdin.isTTY) {

    baseOptions(yargs.usage(Config.cmdline.pipeUsage))
        .option('outfile', {
            alias: 'o',
            describe: Config.cmdline.outfile,
            type: 'string'
        })
        .requiresArg('outfile')
        .example(Config.cmdline.ex1[0], Config.cmdline.ex1[1])
        .example(Config.cmdline.ex2[0], Config.cmdline.ex2[1])
        .example(Config.cmdline.ex3[0], Config.cmdline.ex3[1])
        .epilog('@c2folab')
        .showHelpOnFail(false, '--help for options')
        .strict(true)
        .argv;

    if (yargs.argv.debug)
        Wcrypt.DEBUG = true;

    var mode = 'encrypt';
    if (yargs.argv.decrypt) {
        debug('Setting mode to "decrypt".');
        mode = 'decrypt';
    }

    var destination = process.stdout;
    if (yargs.argv.outfile) {
        if (yargs.argv.debug)
            console.error('Will write to "' + yargs.argv.outfile);
        destination = fs.createWriteStream(yargs.argv.outfile);
    }

    if (mode === 'encrypt') {
        getPassphrase(mode)
            .then(passphrase => {
                var wcrypt = new Wcrypt.cipher({
                    material: {
                        passphrase: passphrase
                    },
                    config: {}
                });
                wcryptStream.encrypt(wcrypt, process.stdin)
                    .pipe(destination);
            })
            .catch(err => {
                console.error(err);
            });
    }
    else if (mode === 'decrypt') {
        wcryptStream.decrypt(getPassphrase, process.stdin)
            .pipe(destination);
    }
}

// Data from file or command line
else {

    baseOptions(yargs.usage(Config.cmdline.usage))
        .option('outfile', {
            alias: 'o',
            describe: Config.cmdline.outfile,
            type: 'string'
        })
        .option('infile', {
            alias: 'i',
            describe: Config.cmdline.infile,
            type: 'string'
        })
        .option('arg', {
            alias: 'a',
            describe: Config.cmdline.arg,
            type: 'string'
        })
        .requiresArg(['arg', 'infile', 'outfile'])
        .conflicts('arg', 'infile')
        .example(Config.cmdline.ex4[0], Config.cmdline.ex4[1])
        .example(Config.cmdline.ex5[0], Config.cmdline.ex5[1])
        .example(Config.cmdline.ex6[0], Config.cmdline.ex6[1])
        .epilog('@c2folab')
        .showHelpOnFail(false, '--help for options')
        .strict(true)
        .argv;

    if (yargs.argv.debug)
        Wcrypt.DEBUG = true;

    if (yargs.argv.version) {
        console.log(Wcrypt.version);
        process.exit();
    }

    var mode = 'encrypt';
    if (yargs.argv.decrypt) {
        debug('Setting mode to "decrypt".');
        mode = 'decrypt';
    }

    var destination = process.stdout;
    if (yargs.argv.outfile) {
        if (yargs.argv.debug)
            console.error('Will write to file "' + yargs.argv.outfile + '".');
        destination = fs.createWriteStream(yargs.argv.outfile);
    }

    var source = process.stdin;
    if (yargs.argv.infile) {
        if (yargs.argv.debug)
            console.error('Will read from file "' + yargs.argv.infile + '".');
        source = fs.createReadStream(yargs.argv.infile);
    }
    else if (yargs.argv.arg) {
        source = new Readable();
        source._read = function noop() {};
        source.push(yargs.argv.arg);
        source.push(null);
    }
    else {
        source = new Readable();
        source._read = function noop() {};
        source.push(getDataFromPrompt());
        source.push(null);
    }
    source.on('error', err => {
        console.error(err.message || err);
    });

    if (mode === 'encrypt') {
        getPassphrase(mode)
            .then(passphrase => {
                var wcrypt = new Wcrypt.cipher({
                    material: {
                        passphrase: passphrase
                    },
                    config: {}
                });
                wcryptStream.encrypt(wcrypt, source).pipe(destination);
            })
            .catch(err => {
                console.error(err);
            });
    }
    else if (mode === 'decrypt') {
        wcryptStream.decrypt(getPassphrase, source)
            .pipe(destination);
    }
}

function debug (msg) {
    var msg = Array.prototype.slice.call(arguments);
    msg.unshift('[debug] ');
    msg = msg.join(' ');
    if (Wcrypt.DEBUG)
        console.error(msg);
}

function baseOptions (u) {
    u["$0"] = 'wcrypt';
    return u 
        .option('decrypt', {
            alias: 'd',
            boolean: true,
            default: false,
            type: 'boolean'
        })
        .option('debug', {
            alias: 'D',
            default: 'false',
            describe: Config.cmdline.debug,
            boolean: true
        })
        .option('version', {
            alias: 'v',
            default: 'false',
            describe: Config.cmdline.version,
            boolean: true
        })
        .help('help')
        .alias('help', 'h');
}

function getDataFromPrompt() {
    return readlineSync.question('Data to encrypt: ');
}

function getPassphraseFromPrompt(mode) {
    return new Promise ((resolve, reject) => {
        var passphrase = readlineSync.question(Config.cmdline.passPrompt, {
            hideEchoBack: true,
            mask: ''
        });
        if (!passphrase)
          reject(new Error(Config.err.passBlank));
        else if (mode === 'encrypt') {
            var confirmPassphrase = readlineSync.question(
            Config.cmdline.passConf, {
                hideEchoBack: true,
                mask: ''
            });
            if (confirmPassphrase !== passphrase) {
                resolve(getPassphraseFromPrompt(mode));
            }
            else {
                resolve(passphrase.toString());
            }
        }
        else {
            resolve(passphrase.toString());
        }
    });
}

function getPassphrase(mode) {
    const passPath = process.env.WCRYPT_PASSFILE || homePassFile;
    return statFile(passPath)
        .then(stats => {
            if (parseInt(stats.mode) === 33152) {
                return readFile(passPath)
                    .then(data => {
                        const passphrase = chop.chomp(data.toString('utf8'));
                        if (!passphrase)
                            throw new Error(Config.err.passBlank);
                        return passphrase;
                    })
                    .catch(err => {
                        if (err.code === 'ENOENT') {
                            debug('No wcryptpass file found.');
                            return getPassphraseFromPrompt(mode);
                        }
                        else if (err.message === Config.err.filePerms) {
                            debug('wcryptpass file has insecure permissions.');
                            return getPassphraseFromPrompt(mode);
                        }
                        else if (err.message === Config.err.passBlank) {
                            throw err;
                        }
                        else {
                            throw err;
                        }
                    });
            }
            else {
                throw new Error(Config.err.filePerms);
            }
        })
        .catch(err => {
            if (err.code === 'ENOENT') {
                debug('No wcryptpass file found.');
                return getPassphraseFromPrompt(mode);
            }
            else if (err.message === Config.err.filePerms) {
                debug('wcryptpass file has insecure permissions.');
                return getPassphraseFromPrompt(mode);
            }
            else {
                throw err;
            }
        });
}
