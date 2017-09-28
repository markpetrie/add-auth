const db = require('./helpers/db');
const request = require('./helpers/request');
const assert = require('chai').assert;

describe('review REST api', () => {

    before(db.drop);

    let token = null;
    before(() => {
        return db.getToken()
            .then(t => db.addRole(t, 'reviewer'))
            .then(t => token = t);
    });

    let reviewer = {
        name: 'Manohla Dargis',
        company: 'The NY Times'
    };
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
    let film1 = null;
    let film2 = null;
    let film3 = null;
    let review1 = null;
    let review2 = null;
    let review3 = null;

    it('creates test data', () => {
        return Promise.all([

            request.post('/reviewers')
                .set('Authorization', token)
                .send(reviewer)
                .then(res => res.body)
                .then(saved => {
                    reviewer = saved;
                    return reviewer;
                }),

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

            request.post('/actors')
                .set('Authorization', token)
                .send(jeff)
                .then(res => res.body)
                .then(saved => {
                    jeff = saved;
                    return jeff;
                })

        ])
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
            });
    });

    it('initial /GET returns empty list', () => {
        return request.get('/reviews')
            .set('Authorization', token)          
            .then(req => {
                const reviews = req.body;
                assert.deepEqual(reviews, []);
            });
    });

    function saveReview(review) {
        return request.post('/reviews')
            .send(review)
            .set('Authorization', token)
            .then(res => res.body);
    }

    it('requires role-based authorization when posting a new review', () => {
        review1 = {
            rating: '4',
            reviewer: reviewer._id,
            review: 'This was a fantastic movie!',
            film: film1._id
        };
        return saveReview(review1)
            .then(saved => {
                assert.ok(saved._id, 'saved has id');
                review1 = saved;
            })
            .then(() => {
                return request
                    .get(`/reviews/${review1._id}`)
                    .set('Authorization', token);
            })
            .then(res => res.body)
            .then(got => {
                assert.equal(got._id, review1._id);
                assert.equal(got.film._id, review1.film);
                assert.equal(got.rating, review1.rating);
                assert.equal(got.reviewer, review1.reviewer);
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

    it('returns list of all reviews', () => {
        review2 = {
            rating: '4',
            reviewer: reviewer._id,
            review: 'This was also a great movie!',
            film: film2._id
        };

        review3 = {
            rating: '3',
            reviewer: reviewer._id,
            review: 'This was an ok movie.',
            film: film3._id
        };

        return Promise.all([
            saveReview(review2),
            saveReview(review3)
        ])
            .then(savedReviews => {
                review2 = savedReviews[0];
                review3 = savedReviews[1];
            })
            .then(() => request.get('/reviews')
                .set('Authorization', token))
            .then(res => res.body)
            .then(reviews => {
                assert.equal(reviews.length, 3);
                assert.deepInclude(reviews, review1);
                assert.deepInclude(reviews, review2);
                assert.deepInclude(reviews, review3);
            });
    });

    it('requires role-based authorization when updating a review', () => {
        review2.rating = 5;

        return request.put(`/reviews/${review2._id}`)
            .set('Authorization', token)
            .send(review2)
            .then(res => res.body)
            .then(updated => {
                assert.equal(updated.rating, 5);
            });
    });

    it('requires role-based authorization when deleting a review', () => {

        return request.delete(`/reviews/${review3._id}`)
            .set('Authorization', token)
            .then(res => res.body)
            .then(result => {
                assert.isTrue(result.removed);
            })
            .then(() => request.get('/reviews')
                .set('Authorization', token))
            .then(res => res.body)
            .then(reviews => {
                assert.equal(reviews.length, 2);
            });
    });

    it('delete a non-existent review is removed false', () => {

        return request.delete(`/reviews/${review3._id}`)
            .set('Authorization', token)
            .then(res => res.body)
            .then(result => {
                assert.isFalse(result.removed);
            });
    });

    it('errors on validation failure', () => {
        return saveReview()
            .then(
                () => { throw new Error('expected failure'); },
                () => { }
            );
    });
});