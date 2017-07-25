#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"
const Readable = require('stream').Readable,
    fs = require('fs'),
    readlineSync = require('readline-sync'),
    Wcrypt = require('../index.js'),
    wcryptStream = require('../lib/node-streams.js'),
    yargs = require('yargs');

Wcrypt.DEBUG = false;

// Data piped to us
if (!process.stdin.isTTY) {

    baseOptions(yargs.usage('Usage: data | $0 [options]'))
        .option('outfile', {
            alias: 'o',
            describe: 'write data to this file',
            type: 'string'
        })
        .requiresArg('outfile')
        .example('cat msg.txt | $0 -o msg.wcrypt', 'encrypt,store in file')
        .example('cat msg.wcrypt | $0 -d', 'decrypt')
        .example('curl http:..:4196 | $0 > aud.wcrypt', 'stream to encrypt')
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
            console.error('Will write to file "' + yargs.argv.outfile + '".');
        destination = fs.createWriteStream(yargs.argv.outfile);
    }

    if (mode === 'encrypt') {
        var wcrypt = new Wcrypt.cipher({
            material: {
                passphrase: getPassphrase(mode)
            },
            config: {}
        });

        wcryptStream.encrypt(wcrypt, process.stdin)
            .pipe(destination);
    }
    else if (mode === 'decrypt') {
        wcryptStream.decrypt(getPassphrase, process.stdin)
            .pipe(destination);
    }
}

// Data from file or command line
else {

    baseOptions(yargs.usage('Usage: $0 [options]'))
        .option('outfile', {
            alias: 'o',
            describe: 'write data to this file',
            type: 'string'
        })
        .option('infile', {
            alias: 'i',
            describe: 'read data from this file',
            type: 'string'
        })
        .option('arg', {
            alias: 'a',
            describe: 'read data from command line',
            type: 'string'
        })
        .requiresArg(['arg', 'infile', 'outfile'])
        .conflicts('arg', 'infile')
        .example('$0 -i msg.txt -o msg.wcrypt', 'file to encrypt')
        .example('$0 -di msg.wcrypt -o msg.txt', 'file to decrypt')
        .example('$0 -a "nonessential appliances"', 'string to encrypt')
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

    if (mode === 'encrypt') {
        var wcrypt = new Wcrypt.cipher({
            material: {
                passphrase: getPassphrase(mode)
            },
            config: {}
        });

        wcryptStream.encrypt(wcrypt, source)
            .pipe(destination);
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
            describe: 'write debug info to stderr',
            boolean: true
        })
        .option('version', {
            alias: 'v',
            default: 'false',
            describe: 'display version and exit',
            boolean: true
        })
        .help('help')
        .alias('help', 'h');
}

function getPassphrase(mode) {
    if (process.env.WCRYPT_PASS) {
        return process.env.WCRYPT_PASS;
    }
    else {
        var passphrase = readlineSync.question('Passphrase? ', {
            hideEchoBack: true,
            mask: ''
        });
        if (mode === 'encrypt') {
            var confirmPassphrase = readlineSync.question('Confirm passphrase: ', {
                hideEchoBack: true,
                mask: ''
            });
            if (confirmPassphrase !== passphrase) {
                passphrase = getPassphrase(mode);
            }
        }
        return passphrase.toString();
    }
}

function getDataFromPrompt() {
    return readlineSync.question('Data to encrypt: ');
}
