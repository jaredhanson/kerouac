#!/usr/bin/env node

var program = require('commander')
  , kerouac = require('../');

program.command('build')
  .description('-> build static site')
  .action(function() {
    kerouac.cli.build();
  });

program.parse(process.argv);
