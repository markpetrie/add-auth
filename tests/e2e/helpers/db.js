
const connection = require('mongoose').connection;
const request = require('./request');
const tokenService = require('../../../lib/auth/token-service');
const User = require('../../../lib/models/user');

module.exports = {
    drop() {
        return connection.dropDatabase();
    },
    getToken(user = { email: 'me@me.com', password: 'abc' }) {
        return request.post('/auth/signup')
            .send(user)
            .then(res => res.body.token);
    },
    addRole(token, role) {
        return tokenService.verify(token)
            .then(user => {
                return User.findByIdAndUpdate(user.id, {
                    $addToSet: { roles:role }
                }, { new: true });

            })
            .then((user) => {
                return tokenService.sign(user);
            });
    }
};