const fs = require('fs');
const cheerio = require('cheerio');
require('colors');

/*eslint-disable no-console*/
module.exports = {
  build: (hash) => {

    fs.readFile('src/client/index.html', 'utf8', (err, markup) => {
      if (err) return console.log(err);

      const $ = cheerio.load(markup);

      $('head').children().last().remove();
      $('body').children().last().remove();

      $('head').prepend(`<link rel="stylesheet" href="styles.${hash}.css">`);
      $('body').append(`<script src="bundle.${hash}.js"></script>`);
      

      fs.writeFile('dist/client/index.html', $.html(), 'utf8', err => {
        if (err) return console.log(err);
        console.log('index.html written to /dist/client'.bold.green);
      });

    });

  }
};
