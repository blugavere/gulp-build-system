'use strict';

const expect = require('expect');
const sinon = require('sinon');
const typescript = require('./typescript');

/**
 * mocha --require clarify src/components/typescript.test.js --watch
 */
describe('typescript', () => {
    let sandbox;
    let gulp = {
        tasks: {},
        task(name) {
            this.tasks[name] = arguments.length - 1;
        }
    };

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('general', () => {
        let tasks;
        beforeEach(() => {
            tasks = {
                tsTask: 'foo',
                tsCompile: 'bar',
                tsLint: 'baz'
            };
        });
        describe('tasks', () => {
            it('task registration', () => {
                typescript(gulp, {}, tasks, {});
                for (const key in tasks) {
                    expect(tasks[key]).toExist();
                }
            });
        });
    });


});