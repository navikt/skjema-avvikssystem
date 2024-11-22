'use strict';

const gulp = require('gulp')

const build = require('@microsoft/sp-build-web');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

if (process.argv.indexOf('dist') !== -1) {
  process.argv.push('--ship')
}
gulp.task('copy-package', function() {
  return gulp.src('./sharepoint/solution/*.sppkg')
  .pipe(gulp.dest('./package'));
});


var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);
  
  result.set('serve', result.get('serve-deprecated'));
  
  return result;
};

let syncVersionsSubtask = build.subTask('version-sync', function (gulp, buildOptions, done) {
  this.log('Syncing versions');
  const fs = require('fs');
  var pkgConfig = require('./package.json');
  var pkgSolution = require('./config/package-solution.json');
  this.log('package-solution.json version:\t' + pkgSolution.solution.version);
  var newVersionNumber = pkgConfig.version.split('-')[0] + '.0';

  if (pkgSolution.solution.version !== newVersionNumber) {
      pkgSolution.solution.version = newVersionNumber;

      this.log('New package-solution.json version:\t' + pkgSolution.solution.version);

      fs.writeFile('./config/package-solution.json', JSON.stringify(pkgSolution, null, 4), function (err, result) {
          if (err) this.log('error', err);
      });
  }
  else {
      this.log('package-solution.json version is up-to-date');
  }

  done();
});
let syncVersionTask = build.task('version-sync', syncVersionsSubtask);
build.rig.addPreBuildTask(syncVersionTask);

build.tslintCmd.enabled = false;

build.initialize(gulp);
