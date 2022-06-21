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

build.initialize(gulp);
