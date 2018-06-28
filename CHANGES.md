## 2018-06-28  Release 0.1.18

Upgrade npm packages.

## 2017-11-14  Release 0.1.17

Update descriptive data in package.json.

## 2017-11-13  Release 0.1.16

Add use strict.
Update README.md.
Use backticks for interpolation in examples.

## 2017-11-13  Release 0.1.15

Add badges to README.md.
Fix github repo links in README.md.
Add .travis.yml.

## 2017-11-11  Release 0.1.14

Add 'paranoid' option to optionally prevent delimiter from showing up in encrypted blocks.
Add event name to emit() call.
Clean up error handling in promises.
Add warnings to README.md about unique initialization vector and salt.
Clean up text in README.md.

## 2017-08-31  Release 0.1.12

  Reduce number of errors emitted during stream error.
  Correct variable name in transcoder.
  Update README.md.

## 2017-08-01  Release 0.1.11

Fix error handling in node-streams.js.
Remove support for WCRYPT_PASS.
Add support for WCRYPT_PASSFILE.
Remove extraneous msgs from browserify script.
Clean up stdout messages in wcrypt cmdline tool.
Remove extraneous debug msgs.
Corrent some indentation.
Update README.md.

## 2017-07-25  Release 0.1.10

Make header definition dynamic based on config.
Add setHeader() class method.
Make getSignature() a class method.
Change file header to handle larger version numbers.
Remove extraneous pkg deps from wcrypt.js.

## 2017-07-13  Release 0.1.9

Update test data for previously failing test.

## 2017-07-13  Release 0.1.8

Add missing signature to SIGNED.txt.

## 2017-07-13  Release 0.1.7

Add PBKDF2 hash to file header.
Add missing catch clause to node-stream.
Catch errors in pipe() when streaming data.
Fix indentation.

## 2017-07-06  Release 0.1.6

Remove algorithm choice from custom config options.
Add derived key length config option.
Fix facility for passing in custom config to constructor.

## 2017-07-02  Release 0.1.5

Add helper lib for node streaming.
Make cmdline utility use new helper lib.
Move debug to class method.
Add test to check debug is working.
Fix indentation.

## 2017-06-04  Release 0.1.4

Remove extraneous pkgs from package.json.
Add package-lock.json.
Update README.md with Node 8 test.

## 2017-05-31  Release 0.1.3

Fix link to github repo.

## 2017-05-31  Release 0.1.2

Fix package versioning.

## 2017-05-31  Release 0.1.1

Fix decrypt() bug resetting material values.

## 2017-05-30  Release 0.1.0

Initial release.
