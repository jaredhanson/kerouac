# Kerouac

> I saw that my life was a vast glowing empty page and I could do anything I
> wanted.
>
> -- Jack Kerouac

Kerouac is a static site generator written in [Node.js](http://nodejs.org/).  It
is the simplest possible tool for transforming content written using lightweight
markup, such as [Markdown](http://daringfireball.net/projects/markdown/), into a
complete website.

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
    site.assets('public');
    
    site.generate(function(err) {
      if (err) {
        console.error(err.message);
        console.error(err.stack);
      }
    });

#### Content,  Layouts, and Assets

A typical static site consists of a content written in [Markdown](http://daringfireball.net/projects/markdown/),
and layouts which structure the content into an HTML page.

Kerouac will render all content within a directory:

    site.content('content');

Content files contain a section known as "front matter" surrounded by three dashes
(`---`).  Front matter specifies metadata about the content, including which
layout should be used when generating a web page.

    ---
    layout: 'main'
    title: 'Welcome'
    ---

    # Hello

    Welcome to my website!

Layouts are located in a `layouts` directory and are rendered using [EJS](https://github.com/visionmedia/ejs). EJS template filenames must end in the extension ".ejs".

    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title><%- title -%></title>
      </head>
      <body>
        <%- content -%>
      </body>
    </html>

Most web sites also contain assets including images, stylesheets, and scripts
that don't need preprocessing.  Kerouac will copy all assets in a given
directory when generating the site:

    site.assets('public');

Note that markup and layout rendering is fully customizable.  Alternatives,
such as [Textile](http://en.wikipedia.org/wiki/Textile_%28markup_language%29)
and [Jade](http://jade-lang.com/), can be used to suit your preferences.

A minimal project directory would include `content`, `layouts`, and `public` subdirectories, along with a site.js file: 

project
├─ content
|  └─ index.md
├─ layouts
|  └─ main.ejs
├─ public
└─ site.js

#### Plugins

Many websites contain sections, such as a sitemap or blog, which conform to an
established set of conventions.  Kerouac supports plugins, which can be used to
bundle up these sections into modules that can be reused across multiple sites.

For example, to generate a sitemap for your site, simply add the [kerouac-sitemap](https://github.com/jaredhanson/kerouac-sitemap)
plugin:

    site.plug(require('kerouac-sitemap')());

A [list](https://github.com/jaredhanson/kerouac/wiki/Plugins) of plugins
developed by the community is available on the [wiki](https://github.com/jaredhanson/kerouac/wiki).

#### Middleware

Just like [Express](http://expressjs.com/) and [Connect](http://www.senchalabs.org/connect/),
Kerouac allows pages to be generated using middleware at both the whole-site and
per-page level.  This is the lowest-level API, and content, assets, and plugins
(as detailed above) are built upon this foundation.

The majority of sites will never need to operate at this level.  If needed, the
API is simple.

    // whole-site middleware
    site.use(function(page, next) {
      console.log('generating ' + page.path);
      next();
    });
    
    // page-level middleware
    site.page('/hello.txt', function(page, next) {
      page.write('Hello!');
      page.end();
    });

A [list](https://github.com/jaredhanson/kerouac/wiki/Middleware) of middleware
developed by the community is available on the [wiki](https://github.com/jaredhanson/kerouac/wiki).

## Examples

The following sites are built with Kerouac, and have public code repositories
that illustrate how to develop using Kerouac's API.

- [Locomotive](http://locomotivejs.org/) — ([source](https://github.com/jaredhanson/www.locomotivejs.org))
- [Passport](http://passportjs.org/) — ([source](https://github.com/jaredhanson/www.passportjs.org))

## Tests

    $ npm install
    $ make test

[![Build Status](https://secure.travis-ci.org/jaredhanson/kerouac.png)](http://travis-ci.org/jaredhanson/kerouac)  [![David DM](https://david-dm.org/jaredhanson/kerouac.png)](http://david-dm.org/jaredhanson/kerouac)

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2012-2013 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>
