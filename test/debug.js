describe('Debug', function () {
  it('Sends output to stderr', function (done) {
    var exec = require('child_process').exec
    var source = 'node -e \'var Wcrypt = require (__dirname);' +
                'Wcrypt.DEBUG = true; var wcrypt = new Wcrypt.Cipher("123");\''
    exec(source, function (error, stdout, stderr) {
      if (error) {
        console.error(error)
      }
      if (stderr.match(/\[debug\] /)) { done() } else { done(new Error('No stderr output detected.')) }
    })
  })
})
