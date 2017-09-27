
const db = require('./helpers/db');
const request = require('./helpers/request');
const { assert } = require('chai');

describe('auth', () => {

    before(db.drop);

    const user = {
        email: 'user',
        password: 'abc'
    };

    describe('user management', () => {

        const badRequest = (url, data, code, error) =>
            request
                .post(url)
                .send(data)
                .then(
                    () => {
                        throw new Error('status should not be ok');
                    },
                    res => {
                        assert.equal(res.status, code);
                        assert.equal(res.response.body.error, error);
                    }
                );

        it('signup requires email', () =>
            badRequest('/auth/signup', { password: 'abc' }, 400, 'both email and password are required')
        );

        it('signup requires password', () =>
            badRequest('/auth/signup', { email: 'abc' }, 400, 'both email and password are required')
        );

        let token = '';

        it('signup', () =>
            request
                .post('/auth/signup')
                .send(user)
                .then(res => assert.ok(token = res.body.token))
        );

        it('can\'t use same email', () =>
            badRequest('/auth/signup', user, 400, 'the email provided is already in use')
        );


        it('signin requires email', () =>
            badRequest('/auth/signin', { password: 'abc' }, 400, 'both email and password are required')
        );

        it('signin requires password', () =>
            badRequest('/auth/signin', { email: 'abc' }, 400, 'both email and password are required')
        );

        it('signin with wrong user', () =>
            badRequest('/auth/signin', { email: 'bad user', password: user.password }, 401, 'Invalid Login')
        );

        it('signin with wrong password', () =>
            badRequest('/auth/signin', { email: user.email, password: 'bad' }, 401, 'Invalid Login')
        );

        it('signin', () =>
            request
                .post('/auth/signin')
                .send(user)
                .then(res => assert.ok(res.body.token))
        );


        it('token is invalid', () =>
            request
                .get('/auth/verify')
                .set('Authorization', 'bad token')
                .then(
                    () => { throw new Error('success response not expected'); },
                    (res) => { assert.equal(res.status, 401); }
                )
        );

        it('token is valid', () =>
            request
                .get('/auth/verify')
                .set('Authorization', token)
                .then(res => assert.ok(res.body))
        );

    });

    describe('unauthorized', () => {

        it('401 with no token', () => {
            return request
                .get('/reviews')
                .then(
                    () => { throw new Error('status should not be 200'); },
                    res => {
                        assert.equal(res.status, 401);
                        assert.equal(res.response.body.error, 'No Authorization Found');
                    }
                );
        });

        it('403 with invalid token', () => {
            return request
                .get('/reviews')
                .set('Authorization', 'badtoken')
                .then(
                    () => { throw new Error('status should not be 200'); },
                    res => {
                        assert.equal(res.status, 401);
                        assert.equal(res.response.body.error, 'Authorization Failed');
                    }
                );
        });
    });

});