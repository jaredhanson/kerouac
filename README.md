# Kerouac

> I saw that my life was a vast glowing empty page and I could do anything I
> wanted.
>
> -- Jack Kerouac

Kerouac is a static site generator.  It is the simplest possible tool for
transforming content written using lightweight markup, such as [Markdown](http://daringfireball.net/projects/markdown/),
into a complete website.

For highly-customized sites, Kerouac is also a powerful framework inspired by [Express](http://expressjs.com/).
Each page in the generated website is declared as a route, which can take
advantage of middleware purpose-built for static pages.  Never before has
been building a hybrid static and dynamic site been so consistent.

## Install

    $ npm install kerouac

## Usage

    var kerouac = require('kerouac');
    var site = kerouac();

    site.set('base url', 'http://www.example.com/');

    site.content('content');
    site.static('public');
    
    site.generate(function(err) {
      if (err) {
        console.error(err.message);
        console.error(err.stack);
        return;
      }
    });

## Tests

    $ npm install
    $ make test

[![Build Status](https://secure.travis-ci.org/jaredhanson/kerouac.png)](http://travis-ci.org/jaredhanson/kerouac)  [![David DM](https://david-dm.org/jaredhanson/kerouac.png)](http://david-dm.org/jaredhanson/kerouac)

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2012-2013 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>
