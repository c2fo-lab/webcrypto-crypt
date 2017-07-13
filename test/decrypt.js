const Config = require('../lib/config.json'),
    expect = require('expect'),
    mocks = new (require('./mocks.js'))(),
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
    variablePlain = data.variable.plaintext,
    variableWithHeader = data.variable.encodings.ciphertextWithHeader;

describe("Decrypt", function() {

    it("Fails with no data", (done) => {
        var wcrypt = new Wcrypt.cipher(testOptions);
        wcrypt.rawDecrypt()
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
                iv: mocks.iv,
                passphrase: mocks.passphrase,
                salt: mocks.salt
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawDecrypt(Buffer.from(fixedCipher.hexAltTagLength, 'hex'))
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
                iv: mocks.iv,
                passphrase: mocks.passphrase,
                salt: mocks.salt
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawDecrypt(Buffer.from(fixedCipher.hexAltTagLength, 'hex'))
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
                iv: mocks.iv,
                passphrase: mocks.passphrase,
                salt: mocks.salt
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawDecrypt(Buffer.from(fixedCipher.hexAltLength, 'hex'))
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
                iv: mocks.iv,
                passphrase: mocks.passphrase,
                salt: mocks.salt
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawDecrypt(Buffer.from(fixedCipher.hexAltLength, 'hex'))
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
                iv: mocks.iv,
                passphrase: mocks.passphrase,
                salt: mocks.salt
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawDecrypt(Buffer.from(fixedCipher.hexAltHash, 'hex'))
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
                iv: mocks.iv,
                passphrase: mocks.passphrase,
                salt: mocks.salt
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawDecrypt(Buffer.from(fixedCipher.hexAltHash, 'hex'))
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
                iv: mocks.iv,
                passphrase: mocks.passphrase,
                salt: mocks.salt
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawDecrypt(Buffer.from(fixedCipher.hexAltIter, 'hex'))
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
                iv: mocks.iv,
                passphrase: mocks.passphrase,
                salt: mocks.salt
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawDecrypt(Buffer.from(fixedCipher.hexAltIter, 'hex'))
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
                    usages: mocks.altUsagesDecrypt
                }
            },
            material: {
                iv: mocks.iv,
                passphrase: mocks.passphrase,
                salt: mocks.salt
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawDecrypt(Buffer.from(fixedCipher.hexAltUsages, 'hex'))
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
                    usages: mocks.altUsagesDecryptInvalid
                }
            },
            material: {
                iv: mocks.iv,
                passphrase: mocks.passphrase,
                salt: mocks.salt
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawDecrypt(Buffer.from(fixedCipher.hexAltUsages, 'hex'))
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
                    usages: mocks.altUsagesDecrypt
                },
                derive: {
                    hash: mocks.altHash,
                    iterations: mocks.altIter,
                    length: mocks.altLength
                }
            },
            material: {
                iv: mocks.iv,
                passphrase: mocks.passphrase,
                salt: mocks.salt
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawDecrypt(Buffer.from(fixedCipher.hexAltSeveral, 'hex'))
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
                    usages: mocks.altUsagesDecryptInvalid
                },
                derive: {
                    hash: mocks.altHashInvalid,
                    iterations: mocks.altIterInvalid,
                    length: mocks.altLengthInvalid
                }
            },
            material: {
                iv: mocks.iv,
                passphrase: mocks.passphrase,
                salt: mocks.salt
            }
        };
        var wcrypt = new Wcrypt.cipher(options);
        wcrypt.rawDecrypt(Buffer.from(fixedCipher.hexAltSeveral, 'hex'))
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
            wcrypt.rawDecrypt(Buffer.from(fixedCipher.hex, 'hex'))
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
            wcrypt.rawDecrypt(Buffer.from(fixedCipher.hex, 'hex'))
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
            wcrypt.rawDecrypt(Buffer.from(fixedCipher.hex, 'hex'))
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
            wcrypt.rawDecrypt(Buffer.from(fixedCipher.hex, 'hex'))
                .then((buf) => {
                    expect(buf).toEqual(Buffer.from(fixedPlain, 'utf8'));
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
            wcrypt.rawDecrypt(Buffer.from(variableCipher.hex, 'hex'))
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
            wcrypt.rawDecrypt(Buffer.from(variableCipher.hex, 'hex'))
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
            wcrypt.rawDecrypt(Buffer.from(variableCipher.hex, 'hex'))
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
            wcrypt.rawDecrypt(Buffer.from(variableCipher.hex, 'hex'))
                .then((buf) => {
                    expect(buf).toEqual(Buffer.from(variablePlain, 'utf8'));
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
            wcrypt.rawDecrypt(mocks.png)
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
            wcrypt.rawDecrypt(mocks.pngCipher)
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
            wcrypt.rawDecrypt(mocks.pngCipher)
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
            wcrypt.rawDecrypt(mocks.pngCipher)
                .then(function(buf) {
                    var hash1, hash2;
                    wcrypt.crypto.subtle.digest( { name: "SHA-256", },
                        transcoder.buf2ab(buf))
                        .then(function(hash){
                            hash1 = Buffer.from(hash).toString('hex');
                            hash2 = mocks.pngHash;
                            expect(hash1).toEqual(hash2);
                            try {
                                var dataURI = 'data:image/png;base64,' +
                                    buf.toString('base64');
                                var img = document.createElement('img');
                                console.log('Rendering decrypted image...');
                                img.src = dataURI;
                                img.title = 'Decrypted image';
                                document.getElementsByTagName('body')[0]
                                    .appendChild(img);
                            }
                            catch (err) {}
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

        describe("decrypt", function() {

            it("Returns file signature", function(done) {
                var wcrypt = new Wcrypt.cipher(mocks.passphrase);
                wcrypt.decrypt(Buffer.from(variableWithHeader.hex, 'hex'))
                    .then((buf) => {
                        expect(buf).toEqual(Buffer.from(variablePlain, 'utf8'));
                        done();
                    })
                    .catch((err) => {
                        done(err);
                    });
            });

        });

    });

});
