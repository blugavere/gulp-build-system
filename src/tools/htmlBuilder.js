
const fs = require('fs');
const cheerio = require('cheerio');
const chalk = require('chalk');

/*eslint-disable no-console*/
module.exports = {
  build: (root, outputPath, hash) => {

    fs.readFile(`${root}/index.html`, 'utf8', (err, markup) => {
      if (err) return console.log(err);

      const $ = cheerio.load(markup);

      $('head').children().last().remove();
      $('body').children().last().remove();

      $('head').prepend(`<link rel="stylesheet" href="styles.${hash}.css">`);
      $('body').append(`<script src="bundle.${hash}.js"></script>`);
      
      fs.writeFile(`${outputPath}/index.html`, $.html(), 'utf8', err => {
        if (err) return console.log(err);
        console.log(chalk.bold(chalk.green(`index.html written to ${outputPath}`)));
      });
    });
  }
};
