describe("Debug", function() {

    it("Sends output to stderr", function(done) {
        var exec = require('child_process').exec,
            source = `node -e 'var Wcrypt = require (__dirname);` +
                `Wcrypt.DEBUG = true; var wcrypt = new Wcrypt.cipher("123");'`;
        exec(source, function(error, stdout, stderr) {
            if (stderr.match(/\[debug\] /))
                done();
            else
                done(new Error('No stderr output detected.'));
        });
    });

});
