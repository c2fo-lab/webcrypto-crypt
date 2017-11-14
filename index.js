'use strict';
const bindexOf = require('bindexof'),
    Config = require('./lib/config.json'),
    Package  = require('./package.json'),
    Transcoder = require('./lib/transcoder.js'),
    Webcrypto = require('node-webcrypto-ossl'),
    transcoder = new Transcoder();

global.Buffer = global.Buffer || Buffer;

module.exports = exports = {

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
            throw Error(Config.err.passReq);
        }
        else if (!options.config) {
            options.config = {};
        }
        else if (!options.material) {
            options.material = {};
        }

        _overrideConfig(options.config);
        _setMaterial(options.material);
        exports.setHeader(config);

        exports.debug('Debugging enabled.');

        wcrypt.createHeader = function () {
            return Buffer.concat([
                exports.getSignature(config),
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
            return wcrypt.rawDecrypt(data, {assumeHeader: true});
        };
        wcrypt.delimiter = config.delimiter;
        wcrypt.encrypt = function (data) {
            return wcrypt.rawEncrypt(data, {includeHeader: true});
        };
        wcrypt.encryptDelimited = function (data) {
            return wcrypt.rawEncrypt(data, {appendDelimiter: true});
        };
        wcrypt.getDelimiter = function () {
            exports.debug('getDelimiter', config.delimiter);
            return Buffer.from(config.delimiter);
        };
        wcrypt.name = Package.name;
        wcrypt.rawDecrypt = _decrypt;
        wcrypt.rawEncrypt = _encrypt;
        wcrypt.subtle = wcrypt.crypto.subtle || wcrypt.crypto.webkitSubtle;
        wcrypt.uriSafeBase64 = function (data) {return transcoder.b642uri(
            transcoder.buf2b64(data)
        )};

        function _decrypt (chunk, options) {
            options = options || {};
            var data;
            if (options.assumeHeader) {
                var parsed = exports.parseHeader(chunk);
                data = parsed.payload;
                _overrideConfig(parsed.config);
                _setMaterial(parsed.material);
                exports.debug('_decrypt salt', Buffer.from(material.salt).toString('hex'));
            }
            else {
                data = chunk;
            }
            exports.debug('_decrypt', JSON.stringify(options));
            return _getKey()
                .then(key => {
                    material.key = key;
                    return _wDecrypt(data);
                })
                .catch(err => {throw err;})
                .then(data => {return data;})
                .catch(err => {throw err;});
        }

        function _deriveKey () {
            exports.debug('_deriveKey salt', Buffer.from(material.salt).toString('hex'));
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
            exports.debug('_encrypt', JSON.stringify(options));
            if (typeof data === 'string') {
                data = Buffer.from(data, 'utf8');
            }
            return _getKey()
                .then(key => {
                    material.key = key;
                    return _wEncrypt(data);
                })
                .catch(err => {throw err;})
                .then(result => {
                    if (config.paranoid) {
                        if (bindexOf(result, wcrypt.getDelimiter()))
                            _encrypt(data, options);
                    }
                    return _encryptedBlock(result, options);
                })
                .catch(err => {throw err;});
        }

        function _encryptedBlock (data, options) {
            options = options || {};
            exports.debug('_encryptedBlock', JSON.stringify(options));
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
            if (material.key) {
                return new Promise((resolve, reject) => {
                    resolve(material.key);
                });
            }
            else {
                return _importKey()
                    .catch(err => {throw err;})
                    .then(key => {
                        material.baseKey = key;
                        return _deriveKey();
                    })
                    .catch(err => {throw err;});
            }
        }

        function _getRandomBytes (numBytes) {
            var buf = new Uint8Array(numBytes);
            return wcrypt.crypto.getRandomValues(buf);
        }

        function _importKey () {
            if (typeof material.passphrase !== 'string') {
                return Promise.reject(config.err.passString);
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

            exports.debug('_overrideConfig overrides', JSON.stringify(overrides));
            config.crypto.usages     = overrides.crypto.usages     || config.crypto.usages;
            config.crypto.tagLength  = overrides.crypto.tagLength  || config.crypto.tagLength;
            config.derive.algorithm  = overrides.derive.algorithm  || config.derive.algorithm;
            config.derive.hash       = overrides.derive.hash       || config.derive.hash;
            config.derive.iterations = overrides.derive.iterations || config.derive.iterations;
            config.derive.length     = overrides.derive.length     || config.derive.length;
            config.paranoid          = overrides.paranoid          || false;
            exports.debug('_overrideConfig result', JSON.stringify(config));

        };

        function _setMaterial (params) {
            params = params || {};
            exports.debug('_setMaterial params', JSON.stringify(params));
            material.iv = params.iv || material.iv || _getRandomBytes(12);
            material.passphrase = params.passphrase || material.passphrase;
            material.salt = params.salt || material.salt || _getRandomBytes(16);
            exports.debug('_setMaterial result', JSON.stringify(material));
        }

        function _uriSafeBase64 (data) {
            return transcoder.b642uri(
                transcoder.buf2b64(data)
            );
        }

        function _wDecrypt (data) {
            return wcrypt.subtle.decrypt(
                {
                    name: config.crypto.algorithm,
                    iv: material.iv,
                    tagLength: config.crypto.tagLength
                },
                material.key,
                transcoder.buf2ab(data)
            )
                .then(result => {
                    return transcoder.ab2buf(result);
                })
                .catch(err => {throw err;});
        }

        function _wEncrypt (data) {
            return wcrypt.subtle.encrypt(
                {
                    name: config.crypto.algorithm,
                    iv: material.iv,
                    tagLength: config.crypto.tagLength
                },
                material.key,
                transcoder.buf2ab(data)
            )
                .then(result => {return transcoder.ab2buf(result);})
                .catch(err => {throw err;});
        }

    },

    debug: function () {
        var msg = Array.prototype.slice.call(arguments);
        msg.unshift('[debug] ');
        msg = msg.join(' ');
        if (exports.DEBUG)
            console.error(msg);
    },

    delimiter: Config.delimiter,

    getSignature: function (config) {
        var v = (exports.version).split('.');
        for (var i = 0; i < v.length; i++) {
            if (v[i].length < 2) v[i] = '0' + v[i];
        }
        v = v.join('.');
        var signature;
        if (config)
            signature = config.signaturePrefix;
        else
            signature = Config.signaturePrefix;
        signature = signature + v;
        return Buffer.from(signature);
    },

    parseHeader: function (data) {
        let config = JSON.parse(JSON.stringify(Config)),
            material = {};

        exports.setHeader(config);

        var signature = (data.slice(0, exports.head.sig.e)).toString('utf8'),
            prefix = signature.substring(0, exports.head.pref),
            version = signature.substring(exports.head.pref, exports.head.sig.e);

        if (prefix != config.signaturePrefix)
             throw new Error(Config.err.sigInvalid + Package.name + Package.version);
        else if (parseInt(version) > parseInt(Package.version))
             console.error(Config.err.encryptOld + Package.name);
        else if (parseInt(version) < parseInt(Package.version))
             console.error(Config.err.encryptNew + Package.name);

        //00  01  02  03  04  05  06  07  08  09  10  11  12  13  14  16  17  18
        // W   C   R   Y   P   T   m   v   .   m   v   .   p   v   2   0   0   0
        //19  20  21  22  23  24  25  26  27  28  29  30  31  32  33  34  35  36
        // 1   2   8   1   2   8   S   H   A   -   5   1   2   i   n   i   t   v
        //37  38  39  40  41  42  43  44  45  46  47  48  49  50  51  52  53  54
        // e   c   t   o   r   -   s   a   l   t   -   -   -   -   -   -   -   -
        //55  56  57  58  59  60  61  62  63  64  65  66
        // -   -   -   -   <   W   c   R   y   P   +   >
        config.derive.iterations = parseInt((data.slice(
            exports.head.iter.b,exports.head.iter.e)).toString('utf8'));
        config.crypto.tagLength  = parseInt(data.slice(
            exports.head.tag.b,exports.head.tag.e).toString('utf8'));
        config.derive.length     = parseInt(data.slice(
            exports.head.length.b,exports.head.length.e).toString('utf8'));
        config.derive.hash       = data.slice(
            exports.head.hash.b,exports.head.hash.e).toString('utf8');
        material.iv              = transcoder.buf2ab(
            data.slice(exports.head.iv.b,exports.head.iv.e));
        material.salt            = transcoder.buf2ab(
            data.slice(exports.head.salt.b,exports.head.salt.e));

        return {
            config: config,
            material: material,
            payload: data.slice(exports.head.salt.e + (config.delimiter.length))
        };

    },

    setHeader: function (config) {
        const sigPos = (exports.getSignature(config)).length,
            iterPos  = sigPos   + (config.derive.iterations.toString()).length,
            tagPos   = iterPos  + (config.crypto.tagLength.toString()).length,
            _length  = tagPos   + (config.derive.length.toString()).length,
            hashPos  = _length  + (config.derive.hash).length,
            ivPos    =  hashPos + config.crypto.ivLength,
            saltPos  = ivPos    + config.derive.saltLength;

        exports.head = {
            hash:   { b: _length, e: hashPos },
            iter:   { b: sigPos,  e: iterPos },
            iv:     { b: hashPos, e: ivPos },
            length: { b: tagPos,  e: _length },
            pref:   (config.signaturePrefix).length,
            salt:   { b: ivPos,   e: saltPos },
            sig:    { b: 0,       e: sigPos },
            tag:    { b: iterPos, e: tagPos }
        };
    },

    version: Package.version

};
