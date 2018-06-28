[![npm](https://img.shields.io/npm/v/webcrypto-crypt.svg)]() [![Travis](https://img.shields.io/travis/c2fo-lab/webcrypto-crypt.svg)]() [![license](https://img.shields.io/github/license/c2fo-lab/webcrypto-crypt.svg)]() [![npm](https://img.shields.io/npm/dw/webcrypto-crypt.svg)]() [![node](https://img.shields.io/node/v/webcrypto-crypt.svg)]() [![GitHub last commit](https://img.shields.io/github/last-commit/c2fo-lab/webcrypto-crypt.svg)]()

  * [Introduction](#introduction)
  * [Install](#install)
  * [Quickstart](#quickstart)
  * [Examples](#examples)
  * [Test](#test)
  * [API](#api)
  * [Processing node streams](#processing-node-streams)
  * [Command-line](#command-line)
  * [Header structure](#header-structure)
  * [Security](#security)
  * [See also](#see-also)
  
# Introduction

**webcrypto-crypt** encrypts and decrypts [data at rest](https://en.wikipedia.org/wiki/Data_at_rest#Concerns_about_data_at_rest) in node or the browser using [secret key cryptography](https://www.ibm.com/support/knowledgecenter/SSYKE2_8.0.0/com.ibm.java.security.component.80.doc/security-component/jsse2Docs/secretkeycryptography.html) in conjunction with a [passphrase](https://en.wikipedia.org/wiki/PBKDF2#Purpose_and_operation).

The package will use either the [Window.crypto](https://developer.mozilla.org/en-US/docs/Web/API/Window/crypto) or [node-webcrypto-ossl](https://github.com/PeculiarVentures/node-webcrypto-ossl) library, depending on where it's running.

Encryption and decryption depend on the [key derivation function](https://en.wikipedia.org/wiki/Key_derivation_function) referred to as [PBKDF2](https://www.w3.org/TR/WebCryptoAPI/#pbkdf2) and the      [symmetric key algorithm](https://en.wikipedia.org/wiki/Symmetric-key_algorithm) called [AES-GCM](https://www.w3.org/TR/WebCryptoAPI/#aes-gcm).

For node, the package provides streaming methods and command-line utility **wcrypt** to deal with files and pipes.

# Install

    λ npm install -g webcrypto-crypt

# Quickstart

## Command-line

### From prompt

    λ wcrypt | wcrypt -d
    Data to encrypt: no honour among consultants.
    Passphrase?
    Confirm passphrase:
    Passphrase?
    no honour among consultants.λ

### From and to file

    λ wcrypt -i LICENSE -o LICENSE.wcrypt
    Passphrase?
    Confirm passphrase:
    λ wcrypt -d -i LICENSE.wcrypt
    Passphrase?
    MIT License

    Copyright (c) 2017 C2FO...

### From arg
 
    λ wcrypt -a 'edge of a dynastic rebellion' > mydata.wcrypt
    Passphrase?
    Confirm passphrase:
    λ cat mydata.wcrypt | wcrypt -d  # or wcrypt -di mydata.wcrypt
    Passphrase?
    edge of a dynastic rebellionλ

### From pipe

    λ echo 'pretty despite its implicit threat' | wcrypt | wcrypt -d
    Passphrase?
    Confirm passphrase:
    Passphrase?
    pretty despite its implicit threat

## Node.js

```javascript
    const Wcrypt = require('webcrypto-crypt'),
        wcrypt = new Wcrypt.cipher('justtesting');
    wcrypt.encrypt('no honour among consultants.')
    .then((buf) => {
        // do something with buf
    });
```

## Browser

```jsx
    <script src="dist/wcrypt.js"></script>
    <script>
        var wcrypt = new Wcrypt.cipher('justtesting');
        wcrypt.encrypt('edge of a dynastic rebellion')
        .then((buf) => {
            // do something with buf
        });
    </script>
```

# Examples

## Node.js

```javascript
#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"
'use strict';
const readlineSync = require('readline-sync'),
    Wcrypt = require('webcrypto-crypt');

function askForData() {
    return readlineSync
        .question('Data to encrypt? ');
}

function askForPassphrase() {
    return readlineSync
        .question('Passphrase to use? ',
            {hideEchoBack: true, mask:''}
    );
}

var wcrypt = new Wcrypt.cipher(askForPassphrase());

wcrypt.encrypt(askForData())
.then((data) => {
    console.log(`
        Encrypted, hex-encoded: ${ data.toString('hex') },
        Encrypted, base64-encoded: ${ data.toString('base64') },
        Encrypted, web-safe base64-encoded: ${ wcrypt.uriSafeBase64(data) },

        Decrypted using same passphrase:`
    );
    wcrypt.decrypt(data)
    .then((data) => {
        console.log('        ' + Buffer.from(data).toString('utf8'));
    });
});
```

    λ node examples/prompts.js
    Passphrase to use?
    Data to encrypt? ambiguous or even contradictory situations

    Encrypted, hex-encoded: c0e82e52c7400925f43e2753249afd8b1527a193917267df53d73d63f287519717c73d3e6c1a3da1797ef19055a49b8402cbb0e10f0a5a294545
    Encrypted, base64-encoded: wOguUsdACSX0PidTJJr9ixUnoZORcmffU9c9Y/KHUZcXxz0+bBo9oXl+8ZBVpJuEAsuw4Q8KWilFRQ==
    Encrypted, web-safe base64-encoded: wOguUsdACSX0PidTJJr9ixUnoZORcmffU9c9Y_KHUZcXxz0.bBo9oXl.8ZBVpJuEAsuw4Q8KWilFRQ--

    Decrypted using same passphrase:
    ambiguous or even contradictory situations
    λ

## Browser

```jsx
<html>
    <head>
        <script src="dist/wcrypt.js"></script>
        <script>
            var wcrypt = new Wcrypt.cipher(prompt("Secret? "));
            wcrypt.encrypt(prompt("Data to encrypt? "))
            .then((data) => {
                 console.log(`
         Encrypted, hex-encoded: ${ data.toString("hex") },
         Encrypted, base64-encoded: ${ data.toString("base64") },
         Encrypted, web-safe base64-encoded: ${ wcrypt.uriSafeBase64(data) },

         Decrypted using same passphrase:`
                 );
                 wcrypt.decrypt(data)
                     .then((data) => {
                         console.log('         ' + Buffer.from(data).toString("utf8"));
                     });
            });
       </script>
   </head>
   <body>
       (Check the Developer console.)
   </body>
</html>
```
    
    // In the dev console, after calls to window.prompt() are satisfied, e.g.:
    1GTLSRGmdkiAn6pwBB1XWYllS2VgF87h8575Ok2NlIzdH42YgoUFRpFiqbYqj2BKLJEQqoQ-
    index.html:11 in a world that allowed such mistakes

# Test

## Tested environments

| **OS** | **Environment** | **Version** |
| :-------- | :------- | :------- |
| Mac Sierra | Chrome  | 67  |
| Mac Sierra | Firefox  | 60  |
| Mac Sierra | Node  | 8.11.3 |
| Mac Sierra | Safari | 11.0 |

## Node.js

    λ npm run test

## Browsers

A file that should run the module tests in the browser is ```test/browser/wcrypt-test.html```. webcrypto-crypt currently injects [browserify](https://www.npmjs.com/package/buffer)'s ```Buffer``` as a global object.

# API

## Wcrypt.getSignature()

Return the current file signature in use by this library as a ```Buffer```.

## Wcrypt.parseHeader(Buffer data)

Provided ```data``` is a valid webcrypto-wcrypt header, parse it and return an object with the following structure:

```json
    {
        "material": {
            "iv": "<iv>",
            "salt": "<salt>",
        },
        "config": {
            "crypto": {
                "tagLength": "<tagLength>"
            },
            "derive": {
                "iterations": "<iterations>"
            }
        }
    }
```

## Wcrypt.setHeader(Object config)

Applies this configuration object to the current file header definition.

## Wcrypt.DEBUG = true | false

If set to ```true```, send debugging statements to stderr.  Default ```false```.

## new Wcrypt.cipher(String passphrase || Object options)

Instantiate a webcrypto-crypt object using just a passphrase or more options beyond the passphrase.  When passing in an object, the minimum specification looks like ```{material: { passphrase: <your passphrase> } }```.  Possible options are described below:

```javascript
    var wcrypt = new Wcrypt.cipher({
        config: {
            crypto: {
                usages: [myU1, myU2...],     // default ['encrypt', 'decrypt']
                tagLength: myTagLength,      // default 128
            },
            delimiter: myDelimiter,          // default '<WcRyP+>'
            derive: {
                hash: myHashFunction,        // default 'SHA-512'
                iterations: myIterations,    // default 2000
                length: myLength,            // default 128
            },
            paranoid: true                   // check each encrypted block
                                             // for incidental presence of
                                             // the delimiter, re-encrypt data
                                             // if detected (very slow).
                                             // default false
        },
        material: {
            iv: myInitializationVector,   // default getRandomValues(new Uint8Array(12))
            passphrase: 'justtesting',    // REQUIRED, passphrase as String
            salt: mySalt                  // default getRandomValues(new Uint8Array(16))
        }
    })
    .then(...
```

Callers passing in their own value for initialization vector (```material.iv```) must ensure that it is [never reused under the same key](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Initialization_vector_.28IV.29).  Likewise, callers passing in their own value for key derivation salt (```material.salt```) should ensure it contains data that explicitly [distinguishes between different operations](https://www.rfc-editor.org/rfc/rfc8018.txt).

## wcrypt.createHeader()

Return a ```Buffer``` filled with the appropriate seed data for encryption.  See [these lines](https://github.com/c2fo-lab/webcrypto-crypt/blob/master/index.js#L322-L329).

## wcrypt.decrypt(Buffer data)

Decrypt ```data``` by first parsing its header section to extract ```config``` and ```material``` settings.  The innvoking ```wcrypt``` object will assume any extracted ```config``` and ```material``` settings for all subsequent operations until overwritten n by reading a different header.  Returns a promise with its resolved value set to a Buffer of the decrypted data.

## wcrypt.delimiter

The current delimiter in use by this library, e.g., ```<WcRyP+>```.

## wcrypt.encrypt(Buffer data)

Encrypt the given data and include a header.  Returns a promise with its resolved value set to a Buffer of the encrypted data.

## wcrypt.encryptDelimited(Buffer data)

Encrypt the given data and include a delimiter.  Returns a promise with its resolved value set to a Buffer of the encrypted data.

## wcrypt.getDelimiter()

Return the delimiter webcrypto-crypt is currently configured to use as a ```Buffer```.

## wcrypt.name

The current name of this library, e.g., ```webcrypto-crypt```.

## wcrypt.rawDecrypt(Buffer data, Object options)

Decrypt ```data```.  Assumes no header present unless ```assumeHeader: true``` is passed in via an ```options``` object.  Returns a promise with its resolved value set to a Buffer of the decrypted data.

## wcrypt.rawEncrypt(Buffer data, Object options)

Returns a promise with its resolved value set to a Buffer of the encrypted data.  The first argument is the data to encrypt.  The second argument ```options``` is optional and currently supports two attributes:

    wcrypt.rawEncrypt('Some text to encrypt', {appendDelimiter: true});

Will append the ```wcrypt.delimiter``` to the end of the encrypted data before returning it.  And:

    wcrypt.rawEncrypt('Some text to encrypt', {includeHeader: true});

Will append a cleartext header to the returned data including: ```initialization vector```, ```iterations```, ```salt```, and ```tagLength``` used in the encryption.  See [these lines](https://github.com/c2fo-lab/webcrypto-crypt/blob/master/index.js#L322-L329).

## wcrypt.subtle

The [SubtleCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto) object currently in use.

## wcrypt.uriSafeBase64(Buffer data)

Convenience method for browser contexts to encode the passed-in ```data``` using [web safe base 64 alphabet](https://tools.ietf.org/html/rfc4648#section-5) and return the result.

## wcrypt.version

The current version of this library, e.g., ```0.1.2```.

# Processing node streams

In a node.js environment, ```webcrypto-crypt/lib/node-streams``` provides convenience methods for encrypting and decrypting [Readable Streams](https://nodejs.org/api/stream.html#stream_readable_streams).  Please assume the following lines precede these examples:

```javascript
    const fs = require('fs'),
        Wcrypt = require('webcrypto-crypt'),
        WcryptStream = require('webcrypto-crypt/lib/node-streams'),
        cleartext = 'LICENSE', ciphertext = cleartext + '.wcrypt';
```

## Encrypt a readable stream

When encrypting you need to pass in your own ```wcrypt``` object:

```javascript
        const wcrypt = new Wcrypt.cipher('justtesting');
        const clear = fs.createReadStream(cleartext),
            encrypted = fs.createWriteStream(ciphertext),
            read = WcryptStream.encrypt(wcrypt, clear);

        read.on('data', (chunk) => {
            encrypted.write(chunk);
        });
        read.on('end', () => {
            console.error('wrote ' + ciphertext);
        });
```

## Decrypt a readable stream

When decrypting you need to pass in the passphrase:

```javascript
        const decrypt = fs.createReadStream(ciphertext),
            read = WcryptStream.decrypt('justtesting', decrypt);
        read.on('data', (chunk) => {
            console.log(chunk.toString('utf8'));
        });
```

# Command-line

Installing **webcrypto-crypt** also installs a command-line utilty, **wcrypt**:

## Help

### TTY

    λ wcrypt -h
    Usage: wcrypt [options]
    
    Options:
      --debug, -D    write debug info to stderr         [boolean] [default: "false"]
      --help, -h     Show help                                             [boolean]
      --outfile, -o  write data to this file                                [string]
      --infile, -i   read data from this file                               [string]
      --arg, -a      read data from command line                            [string]
      --decrypt, -d                                       [boolean] [default: false]
    
    Examples:
      wcrypt -i msg.txt -o msg.wcrypt      file to encrypt
      wcrypt -di msg.wcrypt -o msg.txt     file to decrypt
      wcrypt -a "nonessential appliances"  string to encrypt

### Piped

    λ echo '' | wcrypt -h
    Usage: data | wcrypt [options]
    
    Options:
      --debug, -D    write debug info to stderr         [boolean] [default: "false"]
      --help, -h     Show help                                             [boolean]
      --outfile, -o  write data to this file                                [string]
      --decrypt, -d                                       [boolean] [default: false]
    
    Examples:
      cat msg.txt | wcrypt -o msg.wcrypt       encrypt,store in file
      cat msg.wcrypt | wcrypt -d               decrypt
      curl http:..:4196 | wcrypt > aud.wcrypt  stream to encrypt

## Examples

Note that some of these examples may take a few minutes to download or stream.

Note also that you may set the environment variable **WCRYPT_PASSFILE** to have **wcrypt** skip its passphrase prompts.

### Text file

    λ export TXTFILE_URL="http://web.archive.org/web/20160514230001/http://www.mit.edu/~yandros/doc/command.txt"
    λ curl -Ss "$TXTFILE_URL" | wcrypt > command.wcrypt
    Passphrase?
    Confirm passphrase:
    λ wcrypt -di command.wcrypt -o command.txt
    Passphrase?
    λ less command.txt

### Audio file

    λ export AUDIO_URL="https://ia802509.us.archive.org/18/items/interview-with-neal-stephenson.JUcDkK.popuparchive.org/focus990527b.mp3"
    λ curl -NSs "$AUDIO_URL" | wcrypt > ns-interview.wcrypt # may take a few minutes...
    Passphrase?
    Confirm passphrase:
    λ wcrypt -di ns-interview.wcrypt -o ns-interview.mp3
    Passphrase?
    λ open ns-interview.mp3

### Audio stream

    λ export STREAM_URL="http://vprbbc.streamguys.net/vprbbc24-mobile.mp3"
    λ curl -NSsm 10 "$STREAM_URL" | wcrypt | wcrypt -d | mpg123 -q -
    Passphrase?
    Confirm passphrase:
    Passphrase?

### .wcryptpass

If no passphrase is specified, ```wcrypt``` will consult the environment variable ```WCRYPT_PASSFILE``` and try to use its contents as the path to a file containing the passphrase.  If ```WCRYPT_PASSFILE``` is not defined, ```wcrypt``` will check for a ```.wcryptpass``` file in the user's home directory for the same purpose.  In either case, on Unix systems the permissions of this file need to disallow access to world or group, achievable with, e.g., ```chmod 0600 ~/.wcryptpass```. If the permissions are less strict, the file will be ignored.

# Header structure

See [these lines](https://github.com/c2fo-lab/webcrypto-crypt/blob/master/index.js#L322-L329).

# Security

Security Mail: labs@c2fo.com<br>
PGP key fingerprint: ````E838 B51C C63F 7ED6 0980 9535 4D46 5218 A674 6F81````<br>
Keyserver: pgp.mit.edu<br>

# See also

* [ccrypt](http://ccrypt.sourceforge.net/)
* [introduction to cryptography](https://www.nrc.gov/site-help/e-submittals/intro-crypt.html)
* [webcrypto-examples](https://github.com/diafygi/webcrypto-examples)

# To do
* Promisify mocha tests
* Improve stream handling
* Add key usage permissions to file header
