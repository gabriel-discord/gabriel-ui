#!/usr/bin/env node

/**
 * Builds a package.json from a package-lock.json. Useful as part of CI/CD.
 */

'use strict';

const pkgLock = require('../package-lock.json');
const fs = require('fs');

const pkgBuild = {
  dependencies: {},
  devDependencies: {},
  optionalDependencies: {},
};

const depNames = Object.keys(pkgLock.dependencies);

depNames.forEach((depName) => {
  const dep = pkgLock.dependencies[depName];

  if (dep.dev) {
    pkgBuild.devDependencies[depName] = dep.version;
  } else if (dep.optional) {
    pkgBuild.optionalDependencies[depName] = dep.version;
  } else {
    pkgBuild.dependencies[depName] = dep.version;
  }
});

fs.writeFileSync('package.json', JSON.stringify(pkgBuild));
