const Config = require('./lib/config.json'),
    Package  = require('./package.json'),
    Transcoder = require('./lib/transcoder.js'),
    Webcrypto = require('node-webcrypto-ossl'),
    transcoder = new Transcoder();

global.Buffer = global.Buffer || Buffer;
var W;
module.exports = W = {

    cipher: function (options) {

        var config = JSON.parse(JSON.stringify(Config)),
            material = {},
            wcrypt = this;

        try {
            wcrypt.crypto = new Webcrypto();
        }
        catch(err) {
            wcrypt.crypto = window.crypto || window.msCrypto;
        }

        if (typeof options === 'string') {
            options = {
                config: {},
                material: {
                    passphrase: options
                }
            };
        }
        else if (Array.isArray(options) || typeof options === 'number') {
            throw Error('Please pass in a passphrase string or options object.');
        }
        else if (!options.config) {
            options.config = {};
        }
        else if (!options.material) {
            options.material = {};
        }

        _overrideConfig(options.config);
        _setMaterial(options.material);

        W.debug('Debugging enabled.');

        wcrypt.createHeader = function () {
            W.debug('createHeader');
            return Buffer.concat([
                wcrypt.getSignature(),
                Buffer.from(config.derive.iterations.toString(), 'utf8'),
                Buffer.from(config.crypto.tagLength.toString(), 'utf8'),
                Buffer.from(config.derive.length.toString(), 'utf8'),
                Buffer.from(config.derive.hash.toString(), 'utf8'),
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
                _overrideConfig(parsed.config);
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

        function _overrideConfig (overrides) {
            overrides = overrides || {};

            if (!overrides.crypto)
                overrides.crypto = {};
            if (!overrides.derive)
                overrides.derive = {};

            W.debug('_overrideConfig overrides', JSON.stringify(overrides));
            config.crypto.usages     = overrides.crypto.usages     || config.crypto.usages;
            config.crypto.tagLength  = overrides.crypto.tagLength  || config.crypto.tagLength;
            config.derive.algorithm  = overrides.derive.algorithm  || config.derive.algorithm;
            config.derive.hash       = overrides.derive.hash       || config.derive.hash;
            config.derive.iterations = overrides.derive.iterations || config.derive.iterations;
            config.derive.length     = overrides.derive.length     || config.derive.length;
            W.debug('_overrideConfig result', JSON.stringify(config));

        };

        function _setMaterial (params) {
            params = params || {};
            W.debug('_setMaterial params', JSON.stringify(params));
            material.iv = params.iv || material.iv || _getRandomBytes(12);
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

        // file signature        = 0,10
        config.derive.iterations = parseInt((data.slice(11,15)).toString('utf8'));
        config.crypto.tagLength  = parseInt(data.slice(15,18).toString('utf8'));
        config.derive.length     = parseInt(data.slice(18,21).toString('utf8'));
        config.derive.hash       = data.slice(21,28).toString('utf8');
        material.iv              = transcoder.buf2ab(data.slice(28,40));
        material.salt            = transcoder.buf2ab(data.slice(40,56));
        // 8-byte delimiter      = 56,63

        return {
            config: config,
            material: material,
            payload: data.slice(64)
        };
    },

    version: Package.version

};
