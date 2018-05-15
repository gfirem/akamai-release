// Copyright 2018 Akamai Technologies, Inc. All Rights Reserved
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const fs = require('fs');
const exec = require('child-process-promise').exec;

/**
 * Create a new instance of Release
 *
 * @param {string} source
 * @param {string} target
 * @param {int} nodeVersion
 * @returns {Promise<T>}
 */
module.exports = (source, target, nodeVersion) => {
  if (!source) {
    throw new Error('The source parameter need to be valid');
  }
  if (!target) {
    throw new Error('The target parameter need to be valid');
  }
  nodeVersion = nodeVersion || 8;
  return exec(`pkg ${source} -t node${nodeVersion}-linux-x86,node${nodeVersion}-linux-x64,node${nodeVersion}-win-x86,node${nodeVersion}-win-x64,node${nodeVersion}-macos-x64 --output ${target}`)
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

