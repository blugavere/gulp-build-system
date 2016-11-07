const expect = require('expect');
const gulp = require('gulp');
const GulpConfig = require('./GulpConfig');

/**
 * mocha src/GulpConfig.test.js --watch
 */
describe('Gulp Build System', () => {
    let gulpConfig;
    beforeEach(() => {
        gulpConfig = new GulpConfig(gulp);
    });

    it('should have unit tests', () => {
        expect(true).toBe(true);
    });

    it('should maintain api', () => {
        expect(gulpConfig.init).toExist();
        expect(gulpConfig.initialize).toExist();
    });

    it('should be able to change configurations', () => {
        expect(gulpConfig.setConfig).toExist();
        expect(typeof gulpConfig.setConfig).toBe('function');
    });

    describe('definePaths', () => {
        let clientRoot;
        let serverRoot;
        it('should determine application entry paths', () => {
            gulpConfig.definePaths();
            const config = gulpConfig.config;
            clientRoot = config.clientWatch;
            serverRoot = config.serverWatch;
            expect(config.clientEntry).toExist();
            expect(config.clientWatch).toExist();
            expect(config.serverEntry).toExist();
            expect(config.serverWatch).toExist();
        });

        it('should be able to change application entry paths', () => {
            const config = gulpConfig.config;

            gulpConfig.setConfig({
                clientEntry: './src/public/app.js',
                serverEntry: '/src/server/app.js'
            });

            gulpConfig.definePaths();
            
            expect(config.clientEntry).toExist();
            expect(config.clientWatch).toNotEqual(clientRoot);
            expect(config.serverWatch).toNotEqual(serverRoot);

        });

    });
});
