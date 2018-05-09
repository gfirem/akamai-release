/* eslint-disable */
'use strict';
const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');
const expectedFiles = [
  './releases/akamai-bin-linux-386',
  './releases/akamai-bin-linux-amd64',
  './releases/akamai-bin-mac-amd64',
  './releases/akamai-bin-windows-amd64.exe',
  './releases/akamai-bin-windows-386.exe',
];
const exec = require('child-process-promise').exec;

describe('Release generation', function() {
  it('should the executables be in place', function(done) {
    this.timeout(15000);
    const source = 'bin/akamai-binary.js';
    const target = 'releases/akamai-bin';
    require('../src/release')(source, target)
      .then(() => {
        expectedFiles.forEach((file) => {
          file = path.resolve(file);
          let fileExist = fs.existsSync(file);
          expect(fileExist, 'File ' + file + ' exist ' + fileExist).to.be.true;
        });
        done();
      })
      .catch(done);
  });
  it('clean the files', function(done) {
    exec('rm -rf releases')
      .then(() => {
        done();
      })
      .catch(done);
  });
  it('check if the files exists', function(done) {
    let fileExist = fs.existsSync(path.resolve(expectedFiles[0]));
    expect(fileExist).to.be.false;
    done();
  });
});
