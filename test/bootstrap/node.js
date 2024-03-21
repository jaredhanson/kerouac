var chai = require('chai');

global.expect = chai.expect;

chai.use(require('sinon-chai'));
chai.use(require('chai-kerouac-middleware'));
