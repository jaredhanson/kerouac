var ContentMapper = require('../plugins/content/mapper');

module.exports = function(dir) {
  return new ContentMapper(dir);
};
