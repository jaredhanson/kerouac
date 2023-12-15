#!/usr/bin/env node
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const cli = require('../lib/cli');


console.log('kerouac... do something!');

yargs(hideBin(process.argv))
  .command('serve [port]', 'start the server', function(yargs) {
    return yargs
      .positional('port', {
        describe: 'port to bind on',
        default: 5000
      });
  }, cli.serve)
  .parse()



/*
var program = require('commander')
  , kerouac = require('../');

program.command('build')
  .description('-> build static site')
  .action(function() {
    kerouac.cli.build();
  });

program.parse(process.argv);
*/