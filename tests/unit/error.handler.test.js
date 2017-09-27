const { assert } = require('chai');
const getErrorHandler = require('../../lib/error-handler.js');

describe ('error handler', () => {
    const errorHandler = getErrorHandler();

    it('sends unknown error to 500 "Internal Server Error"', () => {
        const err = {};
        const req = null;
        let code = null;
        let message = null;
        const res = {
            status(c){ code = c; return this; },
            send(m){ message = m;}
        };
        const next = null;

        errorHandler(err, req, res, next);

        assert.equal(code, 500);
        assert.equal(message.error, 'Internal Server Error');
    });

    it('Sends 400 and validation errors when err.name is ValidationError', () => {
        const err = {
            name: 'ValidationError',
            errors: {
                foo: 'fooError',
                bar: 'barError'
            }
        };
        const req = null;
        let code = null;
        let message = null;
        const res = {
            status(c){ code = c; return this; },
            send(m){ message = m; }
        };
        const next = null;

        errorHandler(err, req, res, next);

        assert.equal(code, 400);
        assert.equal(message.error, 'fooError, barError');
    });
});