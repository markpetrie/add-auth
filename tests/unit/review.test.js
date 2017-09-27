const Reviewer = require('../../lib/models/reviewer');
const Studio = require('../../lib/models/studio');
const Actor = require('../../lib/models/actor');
const Film = require('../../lib/models/film');
const Review = require('../../lib/models/review');
const { assert } = require('chai');

describe('Review model', () => {

    it('passes validation with required fields', () => {

        const reviewer = new Reviewer({
            name: 'Manohla Dargis',
            company: 'The NY Times'
        });

        const studio = new Studio({
            name: 'Universal Studios',
            address: {
                city: 'Hollywood',
                state: 'California',
                country: 'USA'
            }
        });

        const jeff = new Actor({
            name: 'Jeff Goldblum',
            dob: new Date('October 22, 1952'),
            pob: 'Pittsburgh, PA'
        });

        const film = new Film({
            title: 'Jurassic Park',
            studio: studio._id,
            released: 1992,
            cast: [{
                role: 'Ian Malcomb',
                actor: jeff._id
            }]
        });

        const review = new Review({
            rating: '4',
            reviewer: reviewer._id,
            review: 'This was an great movie!',
            film: film._id
        });

        return review.validate();
    });

    it('fails validation missing required fields', () => {

        const review = new Review();

        return review.validate()
            .then(
                () => { throw new Error('Expected validation error'); },
                ({ errors }) => {
                    assert.ok(errors.film);
                    assert.ok(errors.rating);
                    assert.ok(errors.review);
                    assert.ok(errors.reviewer);
                }
            );
    });

    it('fails validation with incorrect field type', () => {
        const review = new Review({
            rating: 'not a number',
        });
        return review.validate()
            .then(
                () => { throw new Error('Expected validation error'); },
                ({ errors }) => {

                    assert.ok(errors.rating);
                }
            );
    });

    it('fails validation with out of range rating number', () => {
        const review = new Review({
            rating: 6,
        });
        return review.validate()
            .then(
                () => { throw new Error('Expected validation error'); },
                ({ errors }) => {

                    assert.ok(errors.rating);
                }
            );
    });
});