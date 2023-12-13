module.exports = function(page) {
  
  return function(err) {
    console.log('Page final handler');
    console.log(err);
    
    // TODO: only skip if no error
    page.skip();
  };
};
