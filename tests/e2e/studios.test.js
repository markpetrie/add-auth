const db = require('./helpers/db');
const request = require('./helpers/request');
const assert = require('chai').assert;

describe('studio REST api', () => {

    before(db.drop);

    it('initial /GET returns empty list', () => {

        return request.get('/studios')
            .then(req => {
                const studios = req.body;
                assert.deepEqual(studios, []);
            });
    });
});


let universal = {
    name: 'Universal Pictures',
    address: {
        city: 'Hollywood',
        state: 'California',
        zip: '91608',
        country: 'USA'
    }
};

let warner = {
    name: 'Warner Bros. Pictures',
    address: {
        city: 'Hollywood',
        state: 'California',
        zip: '91522',
        country: 'USA'
    }
};

let fox = {
    name: '20th Century Fox',
    address: {
        city: 'Los Angeles',
        state: 'California',
        zip: '90067',
        country: 'USA'
    }
};

function saveStudio(studio) {

    return request.post('/studios')
        .send(studio)
        .then(res => res.body);
}

describe('studio REST api', () => {

    it('roundtrips a new studio', () => {

        return saveStudio(universal)
            .then(saved => {
                assert.ok(saved._id, 'saved has id');
                universal = saved;
            })
            //THink about making this two separate it statements
            .then(() => {
                return request.get(`/studios/${universal._id}`);
            })
            .then(res => res.body)
            .then(got => {
                assert.deepEqual(got, universal);
                assert.equal(got.name, 'Universal Pictures');
            });
    });
});

describe('studio REST api', () => {

    it('GET returns 404 for non-existent id', () => {
        const nonId = '597e9d4a119656c01e87d37e';
        return request.get(`/${nonId}`)
            .then(
                () => { throw new Error('expected 404'); },
                res => {
                    assert.equal(res.status, 404);
                }
            );
    });

    describe('studio REST api', () => {
        it('returns list of all studios', () => {

            return Promise.all([
                saveStudio(warner),
                saveStudio(fox)
            ])
                .then(savedStudios => {
                    warner = savedStudios[0];
                    fox = savedStudios[1];
                })
                .then(() => request.get('/studios'))
                .then(res => res.body)
                .then(studios => {
                    assert.equal(studios.length, 3);
                    assert.deepInclude(studios, universal);
                    assert.deepInclude(studios, warner);
                    assert.deepInclude(studios, fox);
                });
        });
    });
});

describe('studio REST api', () => {

    it('updates studio', () => {

        universal.name = 'Universal Studios';
        return request.put(`/studios/${universal._id}`)
            .send(universal)
            .then(res => res.body)
            .then(updated => {
                assert.equal(updated.name, 'Universal Studios');
            });
    });
});

describe('studio REST api', () => {
    it('deletes a studio', () => {

        return request.delete(`/studios/${fox._id}`)
            .then(res => res.body)
            .then(result => {
                assert.isTrue(result.removed);
            })
            .then(() => request.get('/studios'))
            .then(res => res.body)
            .then(studios => {
                assert.equal(studios.length, 2);
            });
    });
});

describe('studio REST api', () => {

    it('delete a non-existent studio is removed false', () => {

        return request.delete(`/studios/${fox._id}`)
            .then(res => res.body)
            .then(result => {
                assert.isFalse(result.removed);
            });
    });
});

describe('studio REST api', () => {
    it('errors on validation failure', () => {
        return saveStudio({})
            .then(
                () => { throw new Error('expected failure'); },
                () => { }
            );
    });
});
