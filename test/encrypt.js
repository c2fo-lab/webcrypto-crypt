const Config = require('../lib/config.json'),
    expect = require('expect'),
    mocks = new (require('./mocks.js'))(),
    Package = require('../package.json'),
    transcoder = new (require('../lib/transcoder.js'))(),
    Wcrypt = require('../index.js');

const data = mocks.data,
    fixedCipher = data.fixed.encodings.ciphertext,
    fixedPlain = data.fixed.plaintext,
    testOptions = {material: {
        iv: mocks.iv,
        passphrase: mocks.passphrase,
        salt: mocks.salt
    }},
    variableCipher = data.variable.encodings.ciphertext,
    variablePlain = data.variable.plaintext;

describe("Encrypt", function() {

    it("Fails with no data", (done) => {
        var wcrypt = new Wcrypt.cipher(testOptions);
        wcrypt.rawEncrypt()
        .catch((err) => {
            done();
        });
    });

    it("Accepts valid tagLength override", (done) => {
        var options = {
            config: {
                crypto: {
                    tagLength: mocks.altTagLength
                }
            },
            material: {
                passphrase: mocks.passphrase,
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawEncrypt(fixedPlain)
            .then((data) => {
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it("Rejects invalid tagLength override", (done) => {
        var options = {
            config: {
                crypto: {
                    tagLength: mocks.altTagLengthInvalid
                }
            },
            material: {
                passphrase: mocks.passphrase,
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawEncrypt(fixedPlain)
            .then((data) => {
                done('Invalid configuration accepted.');
            })
            .catch((err) => {
                done();
            });
    });

    it("Accepts valid length override", (done) => {
        var options = {
            config: {
                derive: {
                    length: mocks.altLength
                }
            },
            material: {
                passphrase: mocks.passphrase,
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawEncrypt(fixedPlain)
            .then((data) => {
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it("Rejects invalid length override", (done) => {
        var options = {
            config: {
                derive: {
                    length: mocks.altLengthInvalid
                }
            },
            material: {
                passphrase: mocks.passphrase,
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawEncrypt(fixedPlain)
            .then((data) => {
                done('Invalid configuration accepted.');
            })
            .catch((err) => {
                done();
            });
    });

    it("Accepts valid hash override", (done) => {
        var options = {
            config: {
                derive: {
                    hash: mocks.altHash
                }
            },
            material: {
                passphrase: mocks.passphrase,
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawEncrypt(fixedPlain)
            .then((data) => {
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it("Rejects invalid hash override", (done) => {
        var options = {
            config: {
                derive: {
                    hash: mocks.altHashInvalid
                }
            },
            material: {
                passphrase: mocks.passphrase,
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawEncrypt(fixedPlain)
            .then((data) => {
                done('Invalid configuration accepted.');
            })
            .catch((err) => {
                done();
            });
    });

    it("Accepts valid iterations override", (done) => {
        var options = {
            config: {
                derive: {
                    iterations: mocks.altIter
                }
            },
            material: {
                passphrase: mocks.passphrase,
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawEncrypt(fixedPlain)
            .then((data) => {
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it("Rejects invalid iterations override", (done) => {
        var options = {
            config: {
                derive: {
                    iterations: mocks.altIterInvalid
                }
            },
            material: {
                passphrase: mocks.passphrase,
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawEncrypt(fixedPlain)
            .then((data) => {
                done('Invalid configuration accepted.');
            })
            .catch((err) => {
                done();
            });
    });

    it("Accepts valid usages override", (done) => {
        var options = {
            config: {
                crypto: {
                    usages: mocks.altUsagesEncrypt
                }
            },
            material: {
                passphrase: mocks.passphrase,
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawEncrypt(fixedPlain)
            .then((data) => {
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it("Rejects invalid usages override", (done) => {
        var options = {
            config: {
                crypto: {
                    usages: mocks.altUsagesEncryptInvalid
                }
            },
            material: {
                passphrase: mocks.passphrase,
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawEncrypt(fixedPlain)
            .then((data) => {
                done('Invalid configuration accepted.');
            })
            .catch((err) => {
                done();
            });
    });

    it("Accepts several valid overrides", (done) => {
        var options = {
            config: {
                crypto: {
                    tagLength: mocks.altTagLength,
                    usages: mocks.altUsagesEncrypt
                },
                derive: {
                    hash: mocks.altHash,
                    iterations: mocks.altIter,
                    length: mocks.altLength
                }
            },
            material: {
                passphrase: mocks.passphrase,
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawEncrypt(fixedPlain)
            .then((data) => {
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it("Rejects several invalid overrides", (done) => {
        var options = {
            config: {
                crypto: {
                    tagLength: mocks.altTagLengthInvalid,
                    usages: mocks.altUsagesEncryptInvalid
                },
                derive: {
                    hash: mocks.altHashInvalid,
                    iterations: mocks.altIterInvalid,
                    length: mocks.altLengthInvalid
                }
            },
            material: {
                passphrase: mocks.passphrase,
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawEncrypt(fixedPlain)
            .then((data) => {
                done('Invalid configuration accepted.');
            })
            .catch((err) => {
                done();
            });
    });

    describe("Fixed length UTF-8 string", () => {

        it("Fails with no passphrase", (done) => {
            var options = {material: {
                iv: mocks.iv,
                salt: mocks.salt
            }},
            wcrypt = new Wcrypt.cipher(options);
            wcrypt.rawEncrypt(fixedPlain)
                .catch((err) => {
                    if (err.match(new RegExp(Config.err.passphrase))) {
                        done();
                    }
                    else {
                        done(err);
                    }
            });
        });

        it("Accepts buffer", (done) => {
            var wcrypt = new Wcrypt.cipher(testOptions);
            wcrypt.rawEncrypt(fixedPlain)
                .then((buf) => {
                    expect(buf).toExist();
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it("Returns buffer", (done) => {
            var wcrypt = new Wcrypt.cipher(testOptions);
            wcrypt.rawEncrypt(fixedPlain)
                .then((buf) => {
                    expect(Buffer.isBuffer(buf)).toBeTruthy();
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it("Returns expected buffer", (done) => {
            var wcrypt = new Wcrypt.cipher(testOptions);
            wcrypt.rawEncrypt(fixedPlain)
                .then((buf) => {
                    expect(buf).toEqual(Buffer.from(fixedCipher.hex, 'hex'));
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

    });

    describe("Variable length UTF-8 string", function() {

        it("Fails with no passphrase", function(done) {
            var options = {material: {
                iv: mocks.iv,
                salt: mocks.salt
            }},
            wcrypt = new Wcrypt.cipher(options);
            wcrypt.rawEncrypt(variablePlain)
            .catch((err) => {
                if (err.match(new RegExp(Config.err.passphrase))) {
                    done();
                }
                else {
                    done(err);
                }
            });
        });

        it("Accepts buffer", function(done) {
            var wcrypt = new Wcrypt.cipher(testOptions);
            wcrypt.rawEncrypt(variablePlain)
                .then((buf) => {
                    expect(buf).toExist();
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it("Returns buffer", function(done) {
            var wcrypt = new Wcrypt.cipher(testOptions);
            wcrypt.rawEncrypt(variablePlain)
                .then((buf) => {
                    expect(Buffer.isBuffer(buf)).toBeTruthy();
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it("Returns expected buffer", function(done) {
            var wcrypt = new Wcrypt.cipher(testOptions);
            wcrypt.rawEncrypt(variablePlain)
                .then((buf) => {
                    expect(buf).toEqual(Buffer.from(variableCipher.hex, 'hex'));
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    });

    describe("Binary data", function() {

        it("Fails with no passphrase", function(done) {
            var options = {material: {
                iv: mocks.iv,
                salt: mocks.salt
            }},
            wcrypt = new Wcrypt.cipher(options);
            wcrypt.rawEncrypt(mocks.png)
            .catch((err) => {
                if (err.match(new RegExp(Config.err.passphrase))) {
                    done();
                }
                else {
                    done(err);
                }
            });
        });
    
        it("Accepts buffer", function(done) {
            var wcrypt = new Wcrypt.cipher(testOptions);
            wcrypt.rawEncrypt(mocks.png)
                .then((buf) => {
                    expect(buf).toExist();
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    
        it("Returns buffer", function(done) {
            var wcrypt = new Wcrypt.cipher(testOptions);
            wcrypt.rawEncrypt(mocks.png)
                .then((buf) => {
                    expect(Buffer.isBuffer(buf)).toBeTruthy();
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it("Returns expected buffer", function(done) {
            var wcrypt = new Wcrypt.cipher(testOptions);
            wcrypt.rawEncrypt(mocks.png)
                .then(function(buf) {
                    var hash1, hash2;
                    wcrypt.crypto.subtle.digest( { name: "SHA-256", },
                        transcoder.buf2ab(buf))
                        .then(function(hash){
                            hash1 = Buffer.from(hash).toString('hex');
                            hash2 = mocks.pngCipherHash;
                            expect(hash1).toEqual(hash2);
                            done();
                        })
                        .catch(function(err){
                            done('Hash saved version: ' + err);
                        });
                })
                .catch(function (err) {
                    done('Encrypt: ' + err);
                });
        });
    });

    describe("Variants", function() {

        describe("encrypt", function() {

            it("Returns file signature", function(done) {
                var wcrypt = new Wcrypt.cipher(testOptions);
                wcrypt.encrypt(variablePlain)
                    .then((buf) => {
                        expect(buf.slice(0,14)).toEqual(
                            Buffer.from(Wcrypt.getSignature())
                        );
                        done();
                    })
                    .catch((err) => {
                        done(err);
                    });
            });
        });

        describe("encryptDelimited", function() {
            it("Returns expected delimiter", function(done) {
                var wcrypt = new Wcrypt.cipher(testOptions);
                wcrypt.encryptDelimited(variablePlain)
                    .then((buf) => {
                        expect(buf.slice(-8,buf.length)).toEqual(
                            Buffer.from(wcrypt.getDelimiter())
                        );
                        done();
                    })
                    .catch((err) => {
                        done(err);
                    });
            });
        });

    });

    describe("Version", function() {

        it("Returns expected value", function(done) {
            var wcrypt = new Wcrypt.cipher(testOptions);
            expect(Wcrypt.version).toEqual(Package.version);
            done();
        });

    });

});
