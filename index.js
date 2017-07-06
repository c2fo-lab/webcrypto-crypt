const Config = require('./lib/config.json'),
    Package  = require('./package.json'),
    Transcoder = require('./lib/transcoder.js'),
    Webcrypto = require('node-webcrypto-ossl'),
    transcoder = new Transcoder();

global.Buffer = global.Buffer || Buffer;
var W;
module.exports = W = {

    cipher: function (options) {

        options = options || {};

        if (typeof options === 'string') {
            options = {
                material: {
                    passphrase: options
                }
            };
        }

        let config = JSON.parse(JSON.stringify(Config)),
            material = {},
            wcrypt = this;

        try {
            wcrypt.crypto = new Webcrypto();
        }
        catch(err) {
            wcrypt.crypto = window.crypto || window.msCrypto;
        }

        _setConfig(options.config);
        _setMaterial(options.material);
        W.debug('Debugging enabled.');

        wcrypt.createHeader = function () {
            W.debug('createHeader');
            return Buffer.concat([
                wcrypt.getSignature(),
                Buffer.from(config.derive.iterations.toString(), 'utf8'),
                Buffer.from(config.crypto.tagLength.toString(), 'utf8'),
                Buffer.from(material.length.toString(), 'utf8'),
                transcoder.ab2buf(material.iv),
                transcoder.ab2buf(material.salt),
                wcrypt.getDelimiter()
            ]);
        };
        wcrypt.decrypt = function (data) {
            W.debug('decrypt');
            return wcrypt.rawDecrypt(data, {assumeHeader: true});
        }
        wcrypt.delimiter = config.delimiter;
        wcrypt.encrypt = function (data) {
            W.debug('encrypt');
            return wcrypt.rawEncrypt(data, {includeHeader: true});
        }
        wcrypt.encryptDelimited = function (data) {
            W.debug('encryptDelimited');
            return wcrypt.rawEncrypt(data, {appendDelimiter: true});
        }
        wcrypt.getDelimiter = function () {
            W.debug('getDelimiter', config.delimiter);
            return Buffer.from(config.delimiter);
        };
        wcrypt.getSignature = function () {
            var signature = config.signaturePrefix + W.version;
            return Buffer.from(signature);
        }
        wcrypt.name = Package.name;
        wcrypt.rawDecrypt = _decrypt;
        wcrypt.rawEncrypt = _encrypt;
        wcrypt.subtle = wcrypt.crypto.subtle || wcrypt.crypto.webkitSubtle;
        wcrypt.uriSafeBase64 = function (data) { return transcoder.b642uri(
            transcoder.buf2b64(data)
        ) };

        function _decrypt (chunk, options) {
            options = options || {};
            var data;
            if (options.assumeHeader) {
                var parsed = W.parseHeader(chunk);
                data = parsed.payload;
                _setConfig(parsed.config);
                _setMaterial(parsed.material);
                W.debug('_decrypt salt', Buffer.from(material.salt).toString('hex'));
            }
            else {
                data = chunk;
            }
            W.debug('_decrypt', JSON.stringify(options));
            return _getKey()
                .then((key) => {
                    material.key = key;
                    return _wDecrypt(data);
                })
                .catch((err) => {
                    throw err;
                })
                .then((data) => {
                    return data;
                })
                .catch((err) => {
                    throw err;
                });
        }

        function _deriveKey () {
            W.debug('_deriveKey salt', Buffer.from(material.salt).toString('hex'));
            return wcrypt.subtle.deriveKey(
                {
                    name: config.derive.algorithm,
                    salt: material.salt,
                    iterations: config.derive.iterations,
                    hash: config.derive.hash
                },
                material.baseKey,
                {
                    name: config.crypto.algorithm,
                    length: config.derive.length
                },
                true,
                config.crypto.usages
            );
        }

        function _encrypt (data, options) {
            options = options || {};
            W.debug('_encrypt', JSON.stringify(options));
            if (typeof data === 'string') {
                data = Buffer.from(data, 'utf8');
            }
            return _getKey()
                .then((key) => {
                    material.key = key;
                    return _wEncrypt(data);
                })
                .catch((err) => {
                    throw err;
                })
                .then((data) => {
                    return _encryptedBlock(data, options);
                })
                .catch((err) => {
                    throw err;
                });
        }

        function _encryptedBlock (data, options) {
            options = options || {};
            W.debug('_encryptedBlock', JSON.stringify(options));
            if (options.appendDelimiter && !options.includeHeader) {
                return Buffer.concat([
                    data,
                    wcrypt.getDelimiter()
                ]);
            }
            else if (!options.appendDelimiter && options.includeHeader) {
                return Buffer.concat([
                    wcrypt.createHeader(),
                    data
                ]);
            }
            else if (options.includeHeader && options.appendDelimiter) {
                return Buffer.concat([
                    wcrypt.createHeader(),
                    data,
                    wcrypt.getDelimiter()
                ]);
            }
            else {
                return data;
            }
        }

        function _getKey () {
            W.debug('_getKey');
            if (material.key) {
                return new Promise((resolve, reject) => {
                    resolve(material.key);
                });
            }
            else {
                return _importKey()
                    .catch((err) => {
                        throw err;
                    })
                    .then((key) => {
                        material.baseKey = key;
                        return _deriveKey();
                    })
                    .catch((err) => {
                        throw err;
                    });
            }
        }

        function _getRandomBytes (numBytes) {
            W.debug('_getRandomBytes', numBytes);
            var buf = new Uint8Array(numBytes);
            return wcrypt.crypto.getRandomValues(buf);
        }

        function _importKey () {
            W.debug('_importKey');
            if (typeof material.passphrase !== 'string') {
                return Promise.reject(config.err.passphrase);
            }
            else {
                return wcrypt.subtle.importKey(
                    'raw',
                    transcoder.str2ab(material.passphrase),
                    {'name': config.derive.algorithm},
                    false,
                    ['deriveKey']
                );
            }
        }

        function _setConfig (options) {
            options = options || {};
            W.debug('_setConfig options', JSON.stringify(options));
            config.crypto.algorithm  = options.algorithm  || config.crypto.algorithm;
            config.crypto.keyUsages  = options.keyUsages  || config.crypto.usages;
            config.crypto.tagLength  = options.tagLength  || config.crypto.tagLength;

            config.derive.algorithm  = options.derivation || config.derive.algorithm;
            config.derive.hash       = options.hash       || config.derive.hash;
            config.derive.iterations = options.iterations || config.derive.iterations;
            W.debug('_setConfig result', JSON.stringify(config));

        };

        function _setMaterial (params) {
            params = params || {};
            W.debug('_setMaterial params', JSON.stringify(params));
            material.iv = params.iv   || material.iv || _getRandomBytes(12);
            material.length = params.length || config.derive.length;
            material.passphrase = params.passphrase || material.passphrase;
            material.salt = params.salt || material.salt || _getRandomBytes(16);
            W.debug('_setMaterial result', JSON.stringify(material));
        }

        function _uriSafeBase64 (data) {
            return transcoder.b642uri(
                transcoder.buf2b64(data)
            );
        }

        function _wDecrypt (data) {
            W.debug('_wDecrypt');
            return wcrypt.subtle.decrypt(
                {
                    name: config.crypto.algorithm,
                    iv: material.iv,
                    tagLength: config.crypto.tagLength
                },
                material.key,
                transcoder.buf2ab(data)
            )
                .then((result) => {
                    return transcoder.ab2buf(result);
                })
                .catch((err) => {
                    throw err;
                });
        }

        function _wEncrypt (data) {
            W.debug('_wEncrypt');
            return wcrypt.subtle.encrypt(
                {
                    name: config.crypto.algorithm,
                    iv: material.iv,
                    tagLength: config.crypto.tagLength
                },
                material.key,
                transcoder.buf2ab(data)
            )
                .then((result) => {
                    return transcoder.ab2buf(result);
                })
                .catch((err) => {
                    throw err;
                });
        }

    },

    debug: function () {
        var msg = Array.prototype.slice.call(arguments);
        msg.unshift('[debug] ');
        msg = msg.join(' ');
        if (W.DEBUG)
            console.error(msg);
    },

    delimiter: Config.delimiter,

    parseHeader: function (data) {
        let config = JSON.parse(JSON.stringify(Config)),
            material = {};
        var signature = (data.slice(0,11)).toString('utf8'),
            prefix = signature.substring(0,6),
            version = signature.substring(6,11);
        if (prefix != config.signaturePrefix) {
             throw new Error('Encrypted data not recognized by ' +
                 Package.name + ' (version ' + Package.version + ').');
        }

        else if (parseInt(version) > parseInt(Package.version)) {
             console.error('Data encrypted with a later version of ' + Package.name + 
                 ' (' + version + '). Assuming backward-compatibility with ' +
                 'current version: ' + Package.version + '.'
             );
        }

        // file signature = 0,10
        config.derive.iterations = (data.slice(11,15)).toString('utf8');
        config.crypto.tagLength = data.slice(15,18).toString('utf8');
        material.length = data.slice(18,21).toString('utf8');
        material.iv = transcoder.buf2ab(data.slice(21,33));
        material.salt = transcoder.buf2ab(data.slice(33,49));
        // 8-byte delimiter =  49,56
        return {
          config: config,
          material: material,
          payload: data.slice(57)
        };
    },

    version: Package.version

};
