'use strict';
// No command line arguments, we're just going to use the env vars
const fs = require('fs');
const exec = require('child-process-promise').exec;

/**
 * Create a new instance of Release
 *
 * @param {string} source
 * @param {string} target
 * @returns {Promise<T>}
 */
module.exports = (source, target) => {
  source = source || false;
  target = target || false;
  return exec(`pkg ${source} -t node8-linux-x86,node8-linux-x64,node8-win-x86,node8-win-x64,node8-macos-x64 --output ${target}`)
    .then(function(result) {
      let stdout = result.stdout;
      let stderr = result.stderr;
      console.log('stdout: ', stdout);
      console.log('stderr: ', stderr);
    })
    .then(() => {
      return exec(`ls ${target}\*`)
        .then(result => {
          for (let filename of result.stdout.split('\n')) {
            console.log(filename);
            if (!filename) {
              continue;
            }
            let oldname = filename;
            filename = filename.replace('-win-', '-windows-');
            filename = filename.replace('-x64', '-amd64');
            filename = filename.replace('macos', 'mac');
            filename = filename.replace('x86', '386');
            fs.renameSync(oldname, filename);
            require('child_process').execSync(`shasum -a 256 ${filename} | awk '{print $1}' > ${filename}.sig`);
          }
        })
        .catch(function(err) {
          console.error('ERROR: ', err);
        });
    });
};

