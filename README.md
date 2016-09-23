# README #

This is a starter pack for getting up and running quickly with a hybrid typescript and es2017 node.js application. The intent of this repository is to create portable code that can help ease the migration from purely javascript to a hybrid application, and then eventually fully typescript if you so choose.

### TODOS ###
* Implement dependency injection for gulp decoration
* Integrate instanbul for code-coverage reports and TDD
* Separate out server-build/watch process from client build/watch process so that server doesn't recompile on client changes (and visa versa)
* Create deployment process whereby dist folder is populated with server-side compiled code and client folder is populated with bundled minified production ready code.

### How do I get set up? ###

* npm i
* typings i
* npm run dev