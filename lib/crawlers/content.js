var ContentCrawler = require('../plugins/content/driver');

module.exports = function(dir) {
  return new ContentCrawler(dir);
};
