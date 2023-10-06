// TODO: Can remove this now that frontmatter is being checked for in all files.
exports.render = function(str, options, fn) {
  if ('function' == typeof options) {
    fn = options, options = {};
  }

  // cache requires .filename
  if (options.cache && !options.filename) {
    return fn(new Error('the "filename" option is required for caching'));
  }

  try {
    var path = options.filename;
    var out = options.cache
      ? exports.cache[path] || (exports.cache[path] = str)
      : str;
    fn(null, out);
  } catch (err) {
    fn(err);
  }
}

exports.renderFile = function(path, options, fn) {
  var key = path + ':string';

  if ('function' == typeof options) {
    fn = options, options = {};
  }

  try {
    options.filename = path;
    var str = options.cache
      ? exports.cache[key] || (exports.cache[key] = fs.readFileSync(path, 'utf8'))
      : fs.readFileSync(path, 'utf8');
    exports.render(str, options, fn);
  } catch (err) {
    fn(err);
  }
}

exports.cache = {};
