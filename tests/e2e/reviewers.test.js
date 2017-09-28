const db = require('./helpers/db');
const request = require('./helpers/request');
const assert = require('chai').assert;

describe('reviewer REST api', () => {

    before(db.drop);

    let token = null;
    before(() => {
        return db.getToken()
            .then(t => db.addRole(t, 'reviewer'))
            .then(t => token = t);
    });
        
    it('initial /GET returns empty list', () => {
        return request.get('/reviewers')
            .set('Authorization', token)
            .then(req => {
                const reviewers = req.body;
                assert.deepEqual(reviewers, []);
            });
    });

    let film1 = null;
    let film2 = null;
    let film3 = null;


    let studio1 = {
        name: 'Universal Studios',
        address: {
            city: 'Hollywood',
            state: 'California',
            country: 'USA'
        }
    };
    let studio2 = {
        name: '20th Century Fox',
        address: {
            city: 'Hollywood',
            state: 'California',
            country: 'USA'
        }
    };
    let jeff = {
        name: 'Jeff Goldblum',
        dob: new Date('October 22, 1952'),
        pob: 'Pittsburgh, PA'
    };

    let john = null;
    let amy = null;


    it('creates test data', () => {
        return Promise.all([
            // Saves studios
            request.post('/studios')
                .set('Authorization', token)
                .send(studio1)
                .then(res => res.body)
                .then(saved => {
                    studio1 = saved;
                    return studio1;
                }),

            request.post('/studios')
                .set('Authorization', token)
                .send(studio2)
                .then(res => res.body)
                .then(saved => {
                    studio2 = saved;
                    return studio2;
                }),

            //saves actor
            request.post('/actors')
                .set('Authorization', token)
                .send(jeff)
                .then(res => res.body)
                .then(saved => {
                    jeff = saved;
                    return jeff;
                })

        ])
            //saves films
            .then(() => {
                return request.post('/films')
                    .set('Authorization', token)
                    .send({
                        title: 'Jurassic Park',
                        studio: studio1._id,
                        released: 1993,
                        cast: [{
                            role: 'Ian Malcomb',
                            actor: jeff._id
                        }]
                    });
            })
            .then(res => res.body)
            .then(saved => {
                film1 = saved;
                return film1;
            })

            .then(() => {
                return request.post('/films')
                    .set('Authorization', token)
                    .send({
                        title: 'The Fly',
                        studio: studio2._id,
                        released: 1986,
                        cast: [{
                            role: 'The Fly',
                            actor: jeff._id
                        }]
                    });

            })
            .then(res => res.body)
            .then(saved => {
                film2 = saved;
                return film2;
            })

            .then(() => {
                return request.post('/films')
                    .set('Authorization', token)
                    .send({
                        title: 'Jurassic Park 3',
                        studio: studio2._id,
                        released: 1999,
                        cast: [{
                            role: 'Ian Malcomb',
                            actor: jeff._id
                        }]
                    });

            })
            .then(res => res.body)
            .then(saved => {
                film3 = saved;
                return film3;
            })

            // save reviewers
            .then(() => {
                return request.post('/reviewers')
                    .set('Authorization', token)
                    .send({
                        name: 'John Smith',
                        company: 'Movie Reviews Inc.'
                    });

            })
            .then(res => res.body)
            .then(saved => {
                john = saved;
                return john;
            })

            .then(() => {
                return request.post('/reviewers')
                    .set('Authorization', token)
                    .send({
                        name: 'Amy Jones',
                        company: 'Amy Reviews'
                    });

            })
            .then(res => res.body)
            .then(saved => {
                amy = saved;
                return amy;
            })

            // save reviews

            .then(() => {
                return request.post('/reviews')
                    .set('Authorization', token)
                    .send({
                        rating: '4',
                        reviewer: john._id,
                        review: 'This was also a great movie!',
                        film: film1._id
                    });
            })
            .then(res => res.body)
            .then(saved => {
                let review1 = saved;
                return review1;
            })

            .then(() => {
                return request.post('/reviews')
                    .set('Authorization', token)
                    .send({
                        rating: '3',
                        reviewer: amy._id,
                        review: 'This was also a great movie!',
                        film: film2._id
                    });
            })
            .then(res => res.body)
            .then(saved => {
                let review2 = saved;
                return review2;
            });

    });



    let manohla = {
        name: 'Manohla Dargis',
        company: 'NY Times'
    };

    let david = {
        name: 'David Edelstein',
        company: 'Vulture'
    };

    let jeffrey = {
        name: 'Jeffrey M. Anderson',
        company: 'Common Sense Media'
    };

    function saveReviewer(reviewer) {

        return request.post('/reviewers')            
            .send(reviewer)
            .set('Authorization', token)
            .then(res => res.body)
            .then(saved => {
                reviewer = saved;
                return reviewer;
            });
    }

    it('roundtrips a new reviewer', () => {
        return saveReviewer(manohla)

            .then(saved => {
                assert.ok(saved._id, 'saved has id');
                manohla = saved;
            })
            .then(() => {
                return request.get(`/reviewers/${manohla._id}`)
                    .set('Authorization', token);
            })
            .then(res => res.body)
            .then(got => {
                assert.equal(got.name, manohla.name);
                assert.equal(got._id, manohla._id);
            });
    });

    it('GET returns 404 for non-existent id', () => {
        const nonId = '597e9d4a119656c01e87d37e';
        return request.get(`/${nonId}`)
            .set('Authorization', token)
            .then(
                () => { throw new Error('expected 404'); },
                res => {
                    assert.equal(res.status, 404);
                }
            );
    });

    it('returns list of all reviewers', () => {
        return Promise.all([
            saveReviewer(david),
            saveReviewer(jeffrey)
        ])
            .then(savedReviewers => {
                david = savedReviewers[0];
                jeffrey = savedReviewers[1];
            })
            .then(() => request.get('/reviewers')
                .set('Authorization', token))
            .then(res => res.body)
            .then(reviewers => {
                assert.equal(reviewers.length, 5);
                assert.deepInclude(reviewers, manohla);
                assert.deepInclude(reviewers, david);
                assert.deepInclude(reviewers, jeffrey);
            });
    });

    it('GETs reviewer if it exists', () => {
        return request
            .get(`/reviewers/${john._id}`)
            .set('Authorization', token)
            .then(res => res.body)
            .then(reviewer => {
                assert.equal(reviewer.name, john.name);
                assert.equal(reviewer.company, john.company);
                assert.isOk(reviewer.reviews);
            });
    });

    it('updates reviewer', () => {
        manohla.company = 'The NY Times';
        return request.put(`/reviewers/${manohla._id}`)
            .set('Authorization', token)
            .send(manohla)
            .then(res => res.body)
            .then(updated => {
                assert.equal(updated.company, 'The NY Times');
            });
    });

    it('deletes a reviewer', () => {
        return request.delete(`/reviewers/${jeffrey._id}`)
            .set('Authorization', token)
            .then(res => res.body)
            .then(result => {
                assert.isTrue(result.removed);
            })
            .then(() => request.get('/reviewers')
                .set('Authorization', token))
            .then(res => res.body)
            .then(reviewers => {
                assert.equal(reviewers.length, 4);
            });

    });

    it('delete a non-existent reviewer is removed false', () => {
        return request.delete(`/reviewers/${jeffrey._id}`)
            .set('Authorization', token)
            .then(res => res.body)
            .then(result => {
                assert.isFalse(result.removed);
            });
    });

    it('errors on validation failure', () => {
        return saveReviewer({})
            .then(
                () => { throw new Error('expected failure'); },
                () => { }
            );
    });

});
