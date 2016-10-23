const expect = require('expect');
const gulp = require('gulp');
const GulpConfig = require('./GulpConfig');

describe('Gulp Build System', () => {
    let gulpConfig;
    before(() => {
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

});